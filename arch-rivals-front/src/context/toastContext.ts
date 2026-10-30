import { createContext } from 'react'

/** info : confirmation (« Demande envoyée à X ») ; warning : action refusée, à corriger. */
export type ToastTone = 'info' | 'warning'

/** Affiche un message éphémère. */
type ShowToast = (text: string, tone?: ToastTone) => void

export const ToastContext = createContext<ShowToast | null>(null)
