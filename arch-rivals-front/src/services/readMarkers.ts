// Dernier message lu par équipe, gardé dans le navigateur, par joueur.
// Le back ne suit pas (encore) la lecture des messages : voir BACK-ATTENDU.md à la racine du dépôt.
// Toutes les lectures et écritures sont protégées : navigation privée, stockage bloqué…

type Markers = Record<number, number>

const keyOf = (userId: number) => `arch-rivals.read-markers.${userId}`

function load(userId: number): Markers {
  try {
    const raw = localStorage.getItem(keyOf(userId))
    return raw ? (JSON.parse(raw) as Markers) : {}
  } catch {
    return {}
  }
}

function save(userId: number, markers: Markers) {
  try {
    localStorage.setItem(keyOf(userId), JSON.stringify(markers))
  } catch {
    /* tant pis : les messages compteront comme non lus au prochain chargement */
  }
}

export const readMarkers = {
  /** Identifiant du dernier message lu, ou null si l'équipe n'a jamais été suivie ici. */
  get(userId: number, teamId: number): number | null {
    return load(userId)[teamId] ?? null
  },
  set(userId: number, teamId: number, messageId: number) {
    const markers = load(userId)
    if ((markers[teamId] ?? 0) >= messageId) return
    save(userId, { ...markers, [teamId]: messageId })
  },
}
