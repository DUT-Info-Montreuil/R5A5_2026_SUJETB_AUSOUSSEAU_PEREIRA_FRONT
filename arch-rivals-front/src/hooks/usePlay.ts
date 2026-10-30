import { useOutletContext } from 'react-router'

/** Contexte transmis par PublicLayout à ses pages. */
export type PublicContext = { onPlay: () => void }

/** « Jouer » pour les pages publiques : connexion si besoin, sinon l'espace joueur. */
export const usePlay = () => useOutletContext<PublicContext>().onPlay

/** Même action, mais undefined hors des pages publiques (l'espace joueur est déjà connecté). */
export const usePlayIfPublic = () => useOutletContext<PublicContext | undefined>()?.onPlay
