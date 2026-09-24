import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { LoginPayload, RegisterPayload } from '../../types/auth'
import { authErrorMessage } from '../../utils/authErrors'
import styles from './AuthDialog.module.css'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export type AuthMode = 'login' | 'register'

type AuthDialogProps = {
  open: boolean
  onClose: () => void
  initialMode?: AuthMode
}

const TABS: { mode: AuthMode; label: string }[] = [
  { mode: 'login', label: 'Connexion' },
  { mode: 'register', label: 'Créer un compte' },
]

const focusFirstField = (root: HTMLElement | null) =>
  root?.querySelector<HTMLInputElement>('[role="tabpanel"] input')?.focus()

function AuthContent({ initialMode, onClose }: { initialMode: AuthMode; onClose: () => void }) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const auth = useAuth()
  const rootRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<AuthMode, HTMLButtonElement | null>>({ login: null, register: null })

  // Les formulaires affichent le message de l'erreur levée ; on la traduit ici.
  const handleLogin = async (payload: LoginPayload) => {
    try {
      await auth.login(payload)
    } catch (err) {
      throw new Error(authErrorMessage(err, 'login'), { cause: err })
    }
    onClose()
  }

  const handleRegister = async (payload: RegisterPayload) => {
    try {
      await auth.register(payload)
    } catch (err) {
      throw new Error(authErrorMessage(err, 'register'), { cause: err })
    }
    onClose()
  }

  // Bascule depuis le lien en bas de formulaire : le bouton cliqué disparaît, on place le focus
  // sur le premier champ du nouveau formulaire.
  const switchTo = (next: AuthMode) => {
    setMode(next)
    requestAnimationFrame(() => focusFirstField(rootRef.current))
  }

  // Navigation clavier du tablist (flèches, Début, Fin).
  const handleTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((t) => t.mode === mode)
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = TABS.length - 1
    if (next === null) return
    e.preventDefault()
    const nextMode = TABS[next].mode
    setMode(nextMode)
    tabRefs.current[nextMode]?.focus()
  }

  return (
    <div ref={rootRef} className={styles.inner}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer">
        <span aria-hidden="true">×</span>
      </button>

      <h2 id="auth-title" className={styles.title}>
        Rejoindre l'arène
      </h2>
      <p className={styles.subtitle}>
        {mode === 'login'
          ? 'Connecte-toi pour rejoindre un tournoi.'
          : 'Crée ton compte pour entrer dans la compétition.'}
      </p>

      <div className={styles.tabs} role="tablist" aria-label="Mode" onKeyDown={handleTabKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            ref={(el) => {
              tabRefs.current[tab.mode] = el
            }}
            type="button"
            role="tab"
            id={`auth-tab-${tab.mode}`}
            className={styles.tab}
            aria-selected={mode === tab.mode}
            aria-controls={`auth-panel-${tab.mode}`}
            tabIndex={mode === tab.mode ? 0 : -1}
            onClick={() => setMode(tab.mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`auth-panel-${mode}`} aria-labelledby={`auth-tab-${mode}`}>
        {mode === 'login' ? (
          <LoginForm onSubmit={handleLogin} onSwitchToRegister={() => switchTo('register')} />
        ) : (
          <RegisterForm onSubmit={handleRegister} onSwitchToLogin={() => switchTo('login')} />
        )}
      </div>
    </div>
  )
}

export default function AuthDialog({ open, onClose, initialMode = 'login' }: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressStartedOnBackdrop = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      focusFirstField(dialog)
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Un clic sur le fond (hors du contenu) ferme la modale. On vérifie aussi où le clic a commencé :
  // une sélection de texte démarrée dans un champ et relâchée sur le fond ne doit pas fermer.
  const handleBackdropPress = (e: MouseEvent<HTMLDialogElement>) => {
    pressStartedOnBackdrop.current = e.target === e.currentTarget
  }
  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (pressStartedOnBackdrop.current && e.target === e.currentTarget) onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="auth-title"
      onClose={onClose}
      onMouseDown={handleBackdropPress}
      onClick={handleBackdropClick}
    >
      {/* Démonté à la fermeture : les formulaires repartent vides à chaque ouverture. */}
      {open && <AuthContent initialMode={initialMode} onClose={onClose} />}
    </dialog>
  )
}
