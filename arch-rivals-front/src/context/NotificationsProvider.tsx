import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTournaments } from '../hooks/useTournaments'
import { fetchUnread, subscribeToMessages } from '../services/chat'
import { countJoinRequests, onJoinRequestReceived } from '../services/myTeam'
import { isCaptain } from '../utils/teams'
import { findMyTeam } from '../utils/tournaments'
import { NotificationsContext, type NotificationsContextValue } from './notificationsContext'

/**
 * Badge « Équipes » : messages non lus de mes équipes (GET /api/me/unread, puis message:new en
 * direct) et demandes en attente des équipes dont je suis capitaine. Monté sous
 * TournamentsProvider, dont il lit les équipes. La salle du conseil ouverte marque elle-même
 * ses messages comme lus auprès du back (useTeamChat).
 */
export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const { tournaments, userId } = useTournaments()
  const [unread, setUnread] = useState<Record<number, number>>({})
  const [pendingRequests, setPendingRequests] = useState(0)
  const activeTeam = useRef<number | null>(null)

  // Équipes dont le salon est ouvert (non éliminées, tournoi pas terminé).
  const chatKey = tournaments
    .filter((t) => t.state !== 'termine')
    .map((t) => findMyTeam(t, userId))
    .filter((team) => team !== null && !team.isEliminated)
    .map((team) => team!.id)
    .toSorted((a, b) => a - b)
    .join(',')

  // Équipes dont je gère les demandes : capitaine, inscriptions ouvertes.
  const captainKey = tournaments
    .filter((t) => t.state === 'ouvertes')
    .map((t) => findMyTeam(t, userId))
    .filter((team) => team !== null && isCaptain(team, userId))
    .map((team) => team!.id)
    .join(',')

  const setActiveTeam = useCallback((teamId: number | null) => {
    activeTeam.current = teamId
    if (teamId !== null)
      setUnread((current) => (current[teamId] ? { ...current, [teamId]: 0 } : current))
  }, [])

  // Messages : compte du back, puis salons suivis en direct.
  useEffect(() => {
    if (userId === null || !chatKey) return
    let cancelled = false
    const ids = chatKey.split(',').map(Number)

    fetchUnread()
      .then((counts) => {
        if (cancelled) return
        // La salle ouverte est lue : le back le saura dès qu'elle aura chargé ses messages.
        if (activeTeam.current !== null) counts[activeTeam.current] = 0
        setUnread(counts)
      })
      .catch(() => {
        /* back injoignable : pas de pastille */
      })

    const unsubscribes = ids.map((teamId) =>
      subscribeToMessages(teamId, (message) => {
        if (message.authorId === userId || activeTeam.current === teamId) return
        setUnread((current) => ({ ...current, [teamId]: (current[teamId] ?? 0) + 1 }))
      }),
    )

    return () => {
      cancelled = true
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [chatKey, userId])

  // Demandes en attente : relues à chaque relecture des tournois (accepter, refuser, changer
  // de page), et comptées en direct à chaque nouvelle demande.
  useEffect(() => {
    let cancelled = false
    const ids = captainKey ? captainKey.split(',').map(Number) : []
    Promise.all(ids.map((id) => countJoinRequests(id).catch(() => 0))).then((counts) => {
      if (!cancelled) setPendingRequests(counts.reduce((sum, n) => sum + n, 0))
    })
    const stop = onJoinRequestReceived((teamId) => {
      if (ids.includes(teamId)) setPendingRequests((n) => n + 1)
    })
    return () => {
      cancelled = true
      stop()
    }
  }, [captainKey, tournaments])

  const value = useMemo<NotificationsContextValue>(
    () => ({
      // Une équipe quittée ne compte plus.
      unread: Object.fromEntries(
        Object.entries(unread).filter(([id]) => chatKey.split(',').includes(id)),
      ),
      pendingRequests,
      setActiveTeam,
    }),
    [unread, chatKey, pendingRequests, setActiveTeam],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}
