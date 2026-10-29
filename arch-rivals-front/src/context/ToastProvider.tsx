import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Toast from '../components/layout/Toast/Toast'
import { ToastContext, type ToastTone } from './toastContext'

/** Durée d'affichage : un avertissement reste plus longtemps, il faut le lire en entier. */
const TOAST_MS: Record<ToastTone, number> = { info: 2_800, warning: 6_000 }

/** Un seul toast à la fois : un nouveau message remplace le précédent. */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; text: string; tone: ToastTone } | null>(null)
  const nextId = useRef(0)

  const show = useCallback(
    (text: string, tone: ToastTone = 'info') => setToast({ id: nextId.current++, text, tone }),
    [],
  )

  // Le minuteur repart à chaque nouveau toast ; le nettoyage l'annule.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_MS[toast.tone])
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Toast text={toast?.text ?? null} tone={toast?.tone ?? 'info'} />
    </ToastContext.Provider>
  )
}
