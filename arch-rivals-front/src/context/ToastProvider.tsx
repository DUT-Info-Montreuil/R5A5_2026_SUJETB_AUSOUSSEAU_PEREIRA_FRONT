import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Toast from '../components/layout/Toast/Toast'
import { ToastContext } from './toastContext'

/** Durée d'affichage d'un toast. */
const TOAST_MS = 2_800

/** Un seul toast à la fois : un nouveau message remplace le précédent. */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const nextId = useRef(0)

  const show = useCallback((text: string) => setToast({ id: nextId.current++, text }), [])

  // Le minuteur repart à chaque nouveau toast ; le nettoyage l'annule.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Toast text={toast?.text ?? null} />
    </ToastContext.Provider>
  )
}
