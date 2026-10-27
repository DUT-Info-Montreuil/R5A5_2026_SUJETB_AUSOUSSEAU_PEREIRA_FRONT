/** « Lancelot_V » → « LV », « Gauvain » → « GA ». */
export function initials(name: string) {
  const parts = name.split(/[^A-Za-zÀ-ÿ0-9]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0] ?? '?').slice(0, 2).toUpperCase()
}

/** Initiales d'une bannière, sans les articles : « Chevaliers d'Avalon » → « CA », « Les Croisés » → « C ». */
export function bannerInitials(name: string) {
  const words = name
    .replace(/^(les|le|la|l')\s*/i, '')
    .split(/\s+/)
    .filter((w) => !/^(d'|de|du|des)$/i.test(w))
    .map((w) => w.replace(/^d'/i, ''))
    .filter(Boolean)
  return words.length
    ? words
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '?'
}
