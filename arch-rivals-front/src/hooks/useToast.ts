import { useCallback, useContext } from 'react'
import { ToastContext } from '../context/toastContext'

export function useToast() {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast doit être utilisé dans <ToastProvider>.')
  return show
}

/**
 * Enveloppe une action pour afficher un toast une fois qu'elle a réussi ; en cas d'échec, l'erreur
 * remonte à l'appelant, qui l'affiche à côté du bouton concerné.
 */
export function useToastAfter() {
  const show = useToast()
  return useCallback(
    <A extends unknown[]>(action: (...args: A) => Promise<void>, message: (...args: A) => string) =>
      async (...args: A) => {
        await action(...args)
        show(message(...args))
      },
    [show],
  )
}
