const KEY = 'arch-rivals.token'

// localStorage peut être indisponible (navigation privée stricte, stockage bloqué) : on ignore.
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(KEY, token)
    } catch {
      /* session limitée à l'onglet courant */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* rien à nettoyer */
    }
  },
}
