import { ApiError } from '../services/api'

/** Traduit une erreur d'API en message lisible pour les formulaires de connexion / inscription. */
export function authErrorMessage(err: unknown, mode: 'login' | 'register'): string {
  if (!(err instanceof ApiError)) return 'Une erreur inattendue est survenue.'

  const fromServer = err.status >= 400 && err.status < 500 ? err.message : null

  switch (true) {
    // 0 : fetch impossible. 502/503/504 : le proxy Vite ne joint pas le back (back éteint).
    case err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504:
      return 'Serveur injoignable. Vérifie que le back tourne sur http://localhost:3000.'
    case err.status === 401 && mode === 'login':
      return "Nom d'utilisateur ou mot de passe incorrect."
    case err.status === 409:
      return fromServer ?? 'Cet e-mail ou ce nom d’utilisateur est déjà utilisé.'
    case err.status === 404:
      return 'Route d’authentification introuvable côté serveur.'
    case err.status >= 500:
      return 'Le serveur a rencontré une erreur. Réessaie dans un instant.'
    default:
      return (
        fromServer ?? (mode === 'login' ? 'Connexion impossible.' : 'Inscription impossible.')
      )
  }
}
