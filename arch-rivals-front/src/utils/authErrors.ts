import { ApiError } from '../services/api'

/** « 45 s », « 3 min ». */
function waitLabel(seconds: number) {
  return seconds < 60 ? `${seconds} s` : `${Math.ceil(seconds / 60)} min`
}

/** Traduit une erreur d'API en message lisible pour les formulaires de connexion / inscription. */
export function authErrorMessage(err: unknown, mode: 'login' | 'register'): string {
  if (!(err instanceof ApiError)) return 'Une erreur inattendue est survenue.'

  const fromServer = err.status >= 400 && err.status < 500 ? err.message : null

  switch (true) {
    // 0 : fetch impossible. 502/503/504 : le proxy Vite ne joint pas le back (back éteint).
    case err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504:
      return 'Serveur injoignable. Vérifie que le back tourne sur http://localhost:3000.'
    case err.status === 401 && mode === 'login':
      return 'E-mail ou mot de passe incorrect.'
    // Après chaque échec, le back fait patienter le compte (1 s, 2 s, 4 s… jusqu'à 15 min).
    case err.status === 429:
      return err.retryAfter
        ? `Trop de tentatives. Réessaie dans ${waitLabel(err.retryAfter)}.`
        : 'Trop de tentatives. Réessaie dans un instant.'
    case err.code === 'EMAIL_TAKEN':
      return 'Cet e-mail est déjà utilisé.'
    case err.code === 'USERNAME_TAKEN':
      return 'Ce nom d’utilisateur est déjà pris.'
    case err.status === 409:
      return fromServer ?? 'Cet e-mail ou ce nom d’utilisateur est déjà utilisé.'
    case err.status === 404:
      return 'Route d’authentification introuvable côté serveur.'
    case err.status >= 500:
      return 'Le serveur a rencontré une erreur. Réessaie dans un instant.'
    default:
      return fromServer ?? (mode === 'login' ? 'Connexion impossible.' : 'Inscription impossible.')
  }
}
