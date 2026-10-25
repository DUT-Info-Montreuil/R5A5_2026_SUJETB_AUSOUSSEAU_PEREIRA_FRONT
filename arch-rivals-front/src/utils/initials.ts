/** « Lancelot_V » → « LV », « Gauvain » → « GA ». */
export function initials(name: string) {
  const parts = name.split(/[^A-Za-zÀ-ÿ0-9]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0] ?? '?').slice(0, 2).toUpperCase()
}
