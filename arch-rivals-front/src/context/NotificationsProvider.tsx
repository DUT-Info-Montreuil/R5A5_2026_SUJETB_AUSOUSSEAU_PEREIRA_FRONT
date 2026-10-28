import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTournaments } from '../hooks/useTournaments'
import { fetchMessages, subscribeToMessages } from '../services/chat'
import { countJoinRequests } from '../services/myTeam'
import { readMarkers } from '../services/readMarkers'
import { isCaptain } from '../utils/teams'
import { findMyTeam } from '../utils/tournaments'
import { NotificationsContext, type NotificationsContextValue } from './notificationsContext'

/**
 * Badge « Équipes » : messages non lus de mes équipes et demandes en attente des équipes
 * dont je suis capitaine. Monté sous TournamentsProvider, dont il lit les équipes.
 */
export default function NotificationsProvider({ children }: { children: ReactNode }) {
  const { tournaments, userId } = useTournaments()
  const [unread, setUnread] = useState<Record<number, number>>({})
  const [pendingRequests, setPendingRequests] = useState(0)
  const activeTeam = useRef<number | null>(null)
  /** Dernier message connu par équipe : c'est lui qui devient « lu ». */
  const latest = useRef<Record<number, number>>({})

  // Équipes dont le salon est ouvert (non éliminées, tournoi pas terminé).
  const chatTeams = tournaments
    .filter((t) => t.state !== 'termine')
    .map((t) => findMyTeam(t, userId))
    .filter((team) => team !== null && !team.isEliminated)
    .map((team) => team!.id)
  const chatKey = chatTeams.toSorted((a, b) => a - b).join(',')

  // Équipes dont je gère les demandes : capitaine, inscriptions ouvertes.
  const captainTeams = tournaments
    .filter((t) => t.state === 'ouvertes')
    .map((t) => findMyTeam(t, userId))
    .filter((team) => team !== null && isCaptain(team, userId))
    .map((team) => team!.id)

  const markRead = useCallback(
    (teamId: number) => {
      const last = latest.current[teamId]
      if (userId !== null && last !== undefined) readMarkers.set(userId, teamId, last)
      setUnread((current) => (current[teamId] ? { ...current, [teamId]: 0 } : current))
    },
    [userId],
  )

  const setActiveTeam = useCallback(
    (teamId: number | null) => {
      activeTeam.current = teamId
      if (teamId !== null) markRead(teamId)
    },
    [markRead],
  )

  // Messages : historique pour compter les non-lus, puis salons suivis en direct.
  useEffect(() => {
    if (userId === null || !chatKey) return
    let cancelled = false
    const ids = chatKey.split(',').map(Number)

    for (const teamId of ids) {
      fetchMessages(teamId)
        .then((messages) => {
          if (cancelled) return
          const last = messages.at(-1)?.id ?? 0
          latest.current[teamId] = Math.max(latest.current[teamId] ?? 0, last)
          // Première visite sur ce navigateur : l'historique compte comme lu.
          const marker = readMarkers.get(userId, teamId)
          if (marker === null || activeTeam.current === teamId)
            readMarkers.set(userId, teamId, last)
          const count =
            marker === null || activeTeam.current === teamId
              ? 0
              : messages.filter((m) => m.id > marker && m.authorId !== userId).length
          setUnread((current) => ({ ...current, [teamId]: count }))
        })
        .catch(() => {
          /* salon fermé ou back injoignable : pas de pastille */
        })
    }

    const unsubscribes = ids.map((teamId) =>
      subscribeToMessages(teamId, (message) => {
        latest.current[teamId] = Math.max(latest.current[teamId] ?? 0, message.id)
        if (message.authorId === userId || activeTeam.current === teamId) {
          readMarkers.set(userId, teamId, message.id)
          return
        }
        setUnread((current) => ({ ...current, [teamId]: (current[teamId] ?? 0) + 1 }))
      }),
    )

    return () => {
      cancelled = true
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [chatKey, userId])

  // Demandes en attente : relues à chaque relecture des tournois (accepter, refuser, changer
  // de page). Le back ne pousse pas encore d'événement pour une nouvelle demande.
  const captainKey = captainTeams.join(',')
  useEffect(() => {
    let cancelled = false
    const ids = captainKey ? captainKey.split(',').map(Number) : []
    Promise.all(ids.map((id) => countJoinRequests(id).catch(() => 0))).then((counts) => {
      if (!cancelled) setPendingRequests(counts.reduce((sum, n) => sum + n, 0))
    })
    return () => {
      cancelled = true
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
