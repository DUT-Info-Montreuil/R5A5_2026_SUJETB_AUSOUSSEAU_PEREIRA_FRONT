import { useCallback, useState } from 'react'
import { teamErrorMessage } from '../utils/teamErrors'

/** État d'une action déclenchée par l'utilisateur : en cours, et message d'erreur lisible. */
export function useAsyncAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Renvoie true si l'action a réussi. */
  const run = useCallback(async (action: () => Promise<void>) => {
    setPending(true)
    setError(null)
    try {
      await action()
      return true
    } catch (err) {
      setError(teamErrorMessage(err))
      return false
    } finally {
      setPending(false)
    }
  }, [])

  return { pending, error, run }
}
