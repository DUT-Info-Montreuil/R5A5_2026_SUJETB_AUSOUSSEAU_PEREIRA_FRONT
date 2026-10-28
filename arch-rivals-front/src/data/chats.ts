import type { ChatMessage } from '../types/chat'
import { ME } from './myTeams'

/** Il y a `days` jours à hh:mm (heure locale), pour que les dates du mock restent crédibles. */
function at(days: number, hours: number, minutes: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

/** Il y a `minutes` minutes : les messages « du jour » restent toujours dans le passé. */
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

// Données mock : salle du conseil de chaque équipe, viendront de l'API plus tard.
export const CHATS: Record<string, ChatMessage[]> = {
  t1: [
    {
      id: 'c1',
      authorId: 'm-gauvain',
      author: 'Gauvain',
      text: "On se retrouve à 20h30 sur le vocal pour l'échauffement ?",
      sentAt: minutesAgo(64),
    },
    {
      id: 'c2',
      authorId: ME,
      author: 'Lancelot_V',
      text: 'Oui. Perceval, tu gardes Viper sur Bind.',
      sentAt: minutesAgo(61),
    },
    {
      id: 'c3',
      authorId: 'm-perceval',
      author: 'Perceval.exe',
      text: 'Reçu, chef.',
      sentAt: minutesAgo(60),
    },
  ],
  t3: [
    {
      id: 'c4',
      authorId: 'm-morgane',
      author: 'Morgane',
      text: 'Il nous manque un cinquième avant la clôture du 30.',
      sentAt: at(1, 19, 40),
    },
    {
      id: 'c5',
      authorId: ME,
      author: 'Lancelot_V',
      text: 'Tristan a postulé, je regarde son profil.',
      sentAt: at(1, 21, 12),
    },
  ],
  t4: [
    {
      id: 'c6',
      authorId: 'm-arthur',
      author: 'Arthur_P',
      text: 'Effectif figé, on est prêts pour le 15.',
      sentAt: at(3, 18, 30),
    },
  ],
}

/** Messages que les coéquipiers « envoient » pendant la démo, pour montrer l'arrivée en direct. */
export const INCOMING_POOL: Record<string, Pick<ChatMessage, 'authorId' | 'author' | 'text'>[]> = {
  t1: [
    {
      authorId: 'm-gauvain',
      author: 'Gauvain',
      text: 'Les Lions mènent 10 à 8, on affrontera sûrement eux en finale.',
    },
    { authorId: 'm-morgane', author: 'Morgane', text: 'Je prépare les setups B pour ce soir.' },
    {
      authorId: 'm-bohort',
      author: 'Bohort',
      text: 'Je suis dispo en remplaçant si quelqu’un a un souci de connexion.',
    },
    { authorId: 'm-perceval', author: 'Perceval.exe', text: 'Vocal ouvert, je suis déjà dedans.' },
  ],
}
