import { ApiError } from '../services/api'

/** Traduit une erreur d'API en message lisible pour les actions sur les équipes. */
export function teamErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Une erreur inattendue est survenue.'

  switch (true) {
    // 0 : fetch impossible. 502/503/504 : le proxy Vite ne joint pas le back (back éteint).
    case err.status === 0 || err.status === 502 || err.status === 503 || err.status === 504:
      return 'Serveur injoignable. Réessaie dans un instant.'
    // Route absente : fonction prévue côté front, pas encore livrée par le back.
    case err.status === 404 && err.code === 'NOT_FOUND':
      return 'Cette fonction n’est pas encore disponible sur le serveur.'
    case err.status === 401:
      return 'Ta session a expiré. Reconnecte-toi.'
    case err.status === 429:
      return 'Trop de requêtes. Réessaie dans un instant.'
    case err.status >= 500:
      return 'Le serveur a rencontré une erreur. Réessaie dans un instant.'
    // 403, 404, 409, 422 : le back explique la règle métier refusée.
    default:
      return err.message
  }
}
