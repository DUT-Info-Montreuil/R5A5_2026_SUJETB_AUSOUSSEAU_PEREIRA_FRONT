import { io, type Socket } from 'socket.io-client'
import { getAuthToken } from './api'
import type { JoinRequestDto, MatchDto, MessageDto, TeamDto } from './dto'

// Canal temps réel du back (Socket.IO). Il ne fait que notifier : les écritures passent par HTTP.
// Même origine que l'API : en dev, Vite proxifie /socket.io vers le back (voir vite.config.ts).
// Le token est facultatif (visiteur sans token) ; il est relu à chaque (re)connexion.

/** Événements poussés par le back, avec les mêmes formes que les réponses HTTP. */
type ServerEvents = {
  'tournament:updated': (tournament: { id: number }) => void
  'match:updated': (match: MatchDto) => void
  'team:updated': (team: TeamDto) => void
  'message:new': (message: MessageDto) => void
  'member:kicked': (payload: { teamId: number }) => void
  'team:deleted': (payload: { teamId: number }) => void
  'session:expired': () => void
  /** Reçu par le capitaine, dans son salon personnel (rejoint à la connexion). */
  'joinRequest:new': (request: JoinRequestDto) => void
  /** Reçu par l'auteur de la demande : acceptée, refusée, annulée. */
  'joinRequest:updated': (request: JoinRequestDto) => void
}
type EventName = keyof ServerEvents

type Room = `${'tournament' | 'team'}:${number}`
type JoinAck = { ok: true } | { error: { code: string; message: string } }

/** Origine du back : celle de VITE_API_URL si elle est absolue, sinon celle de la page. */
function serverOrigin() {
  const base = import.meta.env.VITE_API_URL ?? ''
  return /^https?:\/\//.test(base) ? new URL(base).origin : window.location.origin
}

let socket: Socket | null = null
/** Salons suivis, avec le nombre d'abonnés à chacun. */
const rooms = new Map<Room, number>()
/** Écouteurs enregistrés, rebranchés si le socket est recréé (typés par listen). */
type Listener = (...args: any[]) => void
const handlers = new Map<EventName, Set<Listener>>()

function join(room: Room) {
  const [kind, id] = room.split(':')
  socket
    ?.timeout(5_000)
    .emitWithAck(`${kind}:join`, Number(id))
    .then((ack: JoinAck) => {
      if ('error' in ack) console.warn(`Salon ${room} refusé : ${ack.error.code}`)
    })
    .catch(() => {
      // Pas de réponse : le prochain « connect » renverra la demande.
    })
}

/** Le socket n'est ouvert qu'au premier salon suivi. */
function ensureSocket() {
  if (socket) return socket
  socket = io(serverOrigin(), {
    auth: (cb) => cb({ token: getAuthToken() ?? '' }),
  })
  // Chaque reconnexion est une nouvelle connexion pour le back : on y renvoie les salons.
  socket.on('connect', () => rooms.forEach((_, room) => join(room)))
  handlers.forEach((set, event) => set.forEach((handler) => socket!.on(event, handler)))
  return socket
}

/** Suit un salon (tournoi ou équipe) ; renvoie la fonction qui le quitte. */
export function follow(kind: 'tournament' | 'team', id: number): () => void {
  const room: Room = `${kind}:${id}`
  const count = rooms.get(room) ?? 0
  rooms.set(room, count + 1)
  const s = ensureSocket()
  if (count === 0 && s.connected) join(room)

  return () => {
    const left = (rooms.get(room) ?? 1) - 1
    if (left > 0) return void rooms.set(room, left)
    rooms.delete(room)
    if (s.connected) s.emit(`${kind}:leave`, id)
  }
}

/** Écoute un événement du back ; renvoie la fonction qui coupe l'écoute. */
export function listen<E extends EventName>(event: E, handler: ServerEvents[E]): () => void {
  const listener = handler as Listener
  const set = handlers.get(event) ?? new Set()
  set.add(listener)
  handlers.set(event, set)
  socket?.on(event as string, listener)
  return () => {
    set.delete(listener)
    socket?.off(event as string, listener)
  }
}

/** Le token a changé (connexion, déconnexion) : on rouvre le canal avec la nouvelle identité. */
export function reconnectRealtime() {
  if (!socket) return
  socket.disconnect()
  socket.connect()
}
