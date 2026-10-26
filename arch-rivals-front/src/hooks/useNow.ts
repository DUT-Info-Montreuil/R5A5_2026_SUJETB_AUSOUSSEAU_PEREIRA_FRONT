import { useEffect, useState } from 'react'

/** Horodatage courant, rafraîchi toutes les `intervalMs` millisecondes. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
