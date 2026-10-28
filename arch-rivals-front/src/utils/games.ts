/** Sigles des jeux connus de la maquette ; les autres jeux créés par l'admin ont un sigle calculé. */
const KNOWN_TAGS: Record<string, string> = {
  Valorant: 'VAL',
  'League of Legends': 'LOL',
  'Counter-Strike 2': 'CS2',
  'Overwatch 2': 'OW2',
}

/** Sigle de 2 à 3 caractères affiché dans la vignette du jeu. */
export function gameTag(name: string) {
  if (KNOWN_TAGS[name]) return KNOWN_TAGS[name]
  const words = name.split(/\s+/).filter(Boolean)
  const tag = words.length > 1 ? words.map((w) => w[0]).join('') : name
  return tag.slice(0, 3).toUpperCase()
}
