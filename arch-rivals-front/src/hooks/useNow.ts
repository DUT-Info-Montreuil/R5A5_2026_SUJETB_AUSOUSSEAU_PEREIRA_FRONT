import { useEffect, useState } from 'react'

/** Heure courante, rafraîchie à intervalle régulier (comptes à rebours). */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}
