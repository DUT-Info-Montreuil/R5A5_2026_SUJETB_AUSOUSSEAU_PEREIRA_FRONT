/** Scroll fluide vers l'élément `id`, avec un léger décalage au-dessus. */
export function scrollToId(id: string, offset = 20) {
  const el = document.getElementById(id)
  if (!el) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - offset,
    behavior: reduceMotion ? 'auto' : 'smooth',
  })
}
