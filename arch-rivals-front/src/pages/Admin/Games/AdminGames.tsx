import { useEffect, useState } from 'react'
import admin from '../../../components/admin/admin.module.css'
import CreateGameForm from '../../../components/admin/CreateGameForm/CreateGameForm'
import { useToast } from '../../../hooks/useToast'
import { createGame } from '../../../services/admin'
import { fetchGames } from '../../../services/games'
import type { Game } from '../../../types/game'
import list from '../../../styles/listPage.module.css'

/** Jeux proposés aux tournois, avec leurs rôles de jeu (B-08). */
export default function AdminGames() {
  const [games, setGames] = useState<Game[] | null>(null)
  const toast = useToast()

  useEffect(() => {
    let cancelled = false
    fetchGames()
      .then((data) => {
        if (!cancelled) setGames(data)
      })
      .catch(() => {
        if (!cancelled) setGames([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function create(name: string, roles: string[]) {
    await createGame(name, roles)
    setGames(await fetchGames())
    toast(`Jeu « ${name} » ajouté`)
  }

  return (
    <>
      <div className={list.head}>
        <div>
          <p className={list.eyebrow}>✦ ADMINISTRATION</p>
          <h1 className={list.title}>Jeux</h1>
        </div>
      </div>

      <div className={admin.section}>
        <CreateGameForm onCreate={create} />
      </div>

      <section className={admin.section} aria-label="Jeux existants">
        {games === null && <p className={list.empty}>Chargement des jeux…</p>}
        <ul className={list.list}>
          {games?.map((game) => (
            <li key={game.id} className={list.row}>
              <span className={list.main}>
                <span className={list.name}>{game.name}</span>
                <span className={list.meta}>{game.roles.map((r) => r.name).join(' · ')}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
