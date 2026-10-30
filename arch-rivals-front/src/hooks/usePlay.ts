import { useOutletContext } from 'react-router'

/** Contexte transmis par PublicLayout à ses pages. */
export type PublicContext = { onPlay: () => void }

/** « Jouer » pour les pages publiques : connexion si besoin, sinon l'espace joueur. */
export const usePlay = () => useOutletContext<PublicContext>().onPlay
