// Données de démonstration, créées par l'API du back comme le ferait un vrai utilisateur :
// un jeu, des joueurs, des spectateurs, et trois tournois à des étapes différentes.
//
//   npm run seed:demo
//
// Le back doit tourner, avec son compte administrateur créé (npm run seed:admin), et des limites
// de requêtes relevées dans son .env (le script fait une cinquantaine d'inscriptions) :
//   RATE_LIMIT_AUTH=1000
//   RATE_LIMIT_GLOBAL=100000
// Variables facultatives : API_URL, ADMIN_EMAIL, ADMIN_PASSWORD.
// Relancer le script réutilise les comptes et ajoute trois nouveaux tournois.

const API = process.env.API_URL ?? 'http://localhost:3000/api'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@archrivals.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Adm1n-Arch-Rivals!'
const PASSWORD = 'Demo-Arch-Rivals-2026'

const GAME = { name: 'Valorant', roles: ['Duelliste', 'Initiateur', 'Contrôleur', 'Sentinelle'] }
const TEAMS = [
  'Dragons d’Écosse',
  'Chevaliers d’Avalon',
  'Loups de Camelot',
  'Ordre du Griffon',
  'Lions de Bretagne',
  'Garde de Fer',
  'Les Templiers',
  'Bannière Noire',
]
const PLAYERS = [
  'Perceval',
  'Gauvain',
  'Lancelot',
  'Galaad',
  'Bohort',
  'Yvain',
  'Tristan',
  'Keu',
  'Bédivère',
  'Lionel',
  'Sagremor',
  'Dinadan',
  'Lamorak',
  'Gaheris',
  'Agravain',
  'Mordred',
  'Erec',
  'Calogrenant',
  'Méliant',
  'Hector',
  'Pellinore',
  'Urien',
  'Caradoc',
  'Gareth',
  'Bréhus',
  'Dodinel',
  'Escanor',
  'Girflet',
  'Lucan',
  'Morholt',
  'Palamède',
  'Safir',
  'Ségurade',
  'Yder',
  'Aglovale',
  'Brandelis',
  'Clarion',
  'Driant',
  'Esclabor',
  'Floriant',
]
const SPECTATORS = ['Merlin', 'Viviane', 'Morgane', 'Guenièvre', 'Iseut', 'Énide']

// --- Accès à l'API ---

async function call(method, path, token, body) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (res.ok) return data
  if (res.status === 429)
    throw new Error(
      'Trop de requêtes (429) : mets RATE_LIMIT_AUTH=1000 et RATE_LIMIT_GLOBAL=100000 dans le .env du back, puis relance-le.',
    )
  const error = new Error(`${method} ${path} → ${res.status} ${data?.error?.message ?? text}`)
  error.status = res.status
  error.code = data?.error?.code
  throw error
}

const emailOf = (name) =>
  `${name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()}@demo.archrivals`

/** Inscrit le compte, ou s'y connecte s'il existe déjà (script relancé). */
async function account(username) {
  const email = emailOf(username)
  try {
    return await call('POST', '/auth/register', null, { email, username, password: PASSWORD })
  } catch (err) {
    if (err.status !== 409) throw err
    return call('POST', '/auth/login', null, { email, password: PASSWORD })
  }
}

const inHours = (hours) => new Date(Date.now() + hours * 3600e3).toISOString()
const pick = (list, i) => list[i % list.length]

// --- Étapes ---

async function ensureGame(admin) {
  const { games } = await call('GET', '/games?limit=100')
  const existing = games.find((g) => g.name === GAME.name)
  if (existing) return existing
  return (await call('POST', '/games', admin, GAME)).game
}

/**
 * Équipe complète (ou de `size` joueurs) : le capitaine la crée, les autres demandent à la
 * rejoindre, il accepte, puis attribue un rôle à chacun.
 */
async function buildTeam(tournamentId, name, members, roles, size = 5) {
  const [captain, ...others] = members.slice(0, size)
  const { team } = await call('POST', `/tournaments/${tournamentId}/teams`, captain.token, { name })
  for (const player of others) {
    const { joinRequest } = await call('POST', `/teams/${team.id}/join-requests`, player.token)
    await call('POST', `/join-requests/${joinRequest.id}/accept`, captain.token)
  }
  for (const [i, player] of [captain, ...others].entries()) {
    await call('PATCH', `/teams/${team.id}/members/${player.user.id}`, captain.token, {
      roleId: pick(roles, i).id,
    })
  }
  return { ...team, captain, members: [captain, ...others] }
}

async function chat(team, lines) {
  for (const [i, content] of lines.entries()) {
    await call('POST', `/teams/${team.id}/messages`, pick(team.members, i).token, { content })
  }
}

const detail = async (id) => (await call('GET', `/tournaments/${id}`)).tournament

/** Fixe l'horaire des matchs jouables sans horaire : les paris s'y ouvrent. */
async function scheduleReady(admin, tournamentId, hours) {
  const t = await detail(tournamentId)
  const ready = t.matches.filter((m) => m.status === 'ready' && !m.scheduledAt)
  for (const [i, m] of ready.entries()) {
    await call('PATCH', `/matches/${m.id}`, admin, { scheduledAt: inHours(hours + i * 0.25) })
  }
  return ready
}

/**
 * Chaque spectateur mise sur une partie des matchs, avec des montants et des choix variés. Un
 * spectateur qui a trop perdu n'a plus assez d'Écus : sa mise est simplement sautée.
 */
async function bet(spectators, matches, base) {
  for (const [s, spectator] of spectators.entries()) {
    for (const [i, m] of matches.entries()) {
      if ((s + i) % 3 === 2) continue
      const teamId = (s + i) % 2 ? m.teamAId : m.teamBId
      await call('POST', `/matches/${m.id}/bets`, spectator.token, {
        teamId,
        amount: base + ((s * 7 + i * 5) % 15),
      }).catch((err) => {
        if (err.code !== 'INSUFFICIENT_FUNDS') throw err
      })
    }
  }
}

/** Saisit le résultat des matchs jouables, au plus `count` (l'équipe A gagne un match sur deux). */
async function playReady(admin, tournamentId, count = Infinity) {
  const t = await detail(tournamentId)
  const ready = t.matches.filter((m) => m.status === 'ready').slice(0, count)
  for (const [i, m] of ready.entries()) {
    const [scoreA, scoreB] = i % 2 ? [9, 13] : [13, 7 + (i % 4)]
    await call('POST', `/matches/${m.id}/result`, admin, { scoreA, scoreB })
  }
  return ready.length
}

async function main() {
  const admin = (
    await call('POST', '/auth/login', null, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    })
  ).token
  console.log('✓ Connecté en administrateur')

  const game = await ensureGame(admin)
  console.log(`✓ Jeu « ${game.name} » (${game.roles.map((r) => r.name).join(', ')})`)

  const players = []
  for (const name of PLAYERS) players.push(await account(name))
  const spectators = []
  for (const name of SPECTATORS) spectators.push(await account(name))
  console.log(`✓ ${players.length} joueurs et ${spectators.length} spectateurs`)

  const stamp = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  const squads = (offset) =>
    TEAMS.map((name, i) => ({
      name,
      members: Array.from({ length: 5 }, (_, j) => pick(players, offset + i * 5 + j)),
    }))

  // 1. Tournoi terminé : podium de l'accueil, paris réglés (classement de la semaine).
  const done = (
    await call('POST', '/tournaments', admin, {
      name: `Joute d’automne (${stamp})`,
      gameId: game.id,
    })
  ).tournament
  for (const squad of squads(0)) await buildTeam(done.id, squad.name, squad.members, game.roles)
  await call('POST', `/tournaments/${done.id}/close`, admin)
  await call('POST', `/tournaments/${done.id}/start`, admin)
  for (let round = 0; round < 3; round++) {
    const ready = await scheduleReady(admin, done.id, 1)
    await bet(spectators, ready, 10)
    await playReady(admin, done.id)
  }
  console.log(`✓ « ${done.name} » : terminé, paris réglés`)

  // 2. Tournoi en cours : une équipe incomplète (forfait), des résultats, des paris ouverts.
  const live = (
    await call('POST', '/tournaments', admin, {
      name: `Coupe de Camelot (${stamp})`,
      gameId: game.id,
    })
  ).tournament
  const liveTeams = []
  for (const [i, squad] of squads(3).entries()) {
    liveTeams.push(await buildTeam(live.id, squad.name, squad.members, game.roles, i === 7 ? 4 : 5))
  }
  await chat(liveTeams[0], [
    'Entraînement ce soir à 20 h, qui est dispo ?',
    'Présent ! On revoit les retakes sur Ascent ?',
    'Ok pour moi, je prépare les compos.',
  ])
  await call('POST', `/tournaments/${live.id}/close`, admin)
  const quarters = await scheduleReady(admin, live.id, 2)
  await bet(spectators, quarters, 10)
  await call('POST', `/tournaments/${live.id}/start`, admin)
  await playReady(admin, live.id, 2)
  await bet(spectators, await scheduleReady(admin, live.id, 3), 10)
  console.log(`✓ « ${live.name} » : en cours, résultats saisis et paris ouverts`)

  // 3. Tournoi aux inscriptions ouvertes : équipes à compléter, une demande en attente.
  const open = (
    await call('POST', '/tournaments', admin, {
      name: `Grand Tournoi d’hiver (${stamp})`,
      gameId: game.id,
      registrationClosesAt: inHours(24 * 14),
    })
  ).tournament
  const winterTeams = [
    { name: 'Dragons d’Écosse', members: players.slice(0, 5) },
    { name: 'Loups de Camelot', members: players.slice(5, 8) },
    { name: 'Ordre du Griffon', members: players.slice(8, 9) },
  ]
  const built = []
  for (const team of winterTeams)
    built.push(await buildTeam(open.id, team.name, team.members, game.roles, team.members.length))
  await call('POST', `/teams/${built[1].id}/join-requests`, players[20].token)
  console.log(`✓ « ${open.name} » : inscriptions ouvertes, une demande en attente`)

  console.log(`
Comptes de test (mot de passe : ${PASSWORD}) :
  Spectateur avec des paris  ${emailOf(SPECTATORS[0])}
  Capitaine avec une demande d'adhésion à traiter (tournoi d'hiver)
                             ${emailOf(players[5].user.username)}
  Joueur du tournoi en cours ${emailOf(players[3].user.username)}
  Joueur sans équipe l'hiver ${emailOf(players[30].user.username)}
  Administrateur             ${ADMIN_EMAIL}`)
}

main().catch((err) => {
  console.error(`✗ ${err.message}`)
  process.exit(1)
})
