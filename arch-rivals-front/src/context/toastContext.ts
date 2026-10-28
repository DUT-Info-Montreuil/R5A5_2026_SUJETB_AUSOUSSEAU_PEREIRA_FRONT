import { createContext } from 'react'

/** Affiche un message de confirmation éphémère (« Demande envoyée à X »…). */
export type ShowToast = (text: string) => void

export const ToastContext = createContext<ShowToast | null>(null)
