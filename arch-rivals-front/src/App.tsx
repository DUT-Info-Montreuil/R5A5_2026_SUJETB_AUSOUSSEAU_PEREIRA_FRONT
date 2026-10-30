import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import AdminLayout from './components/layout/AdminLayout/AdminLayout'
import PlayerLayout from './components/layout/PlayerLayout/PlayerLayout'
import ProtectedRoute from './components/routing/ProtectedRoute'
import AdminGames from './pages/Admin/Games/AdminGames'
import AdminTournament from './pages/Admin/Tournament/AdminTournament'
import AdminTournaments from './pages/Admin/Tournaments/AdminTournaments'
import Home from './pages/Home/Home'
import Profile from './pages/Player/Profile/Profile'
import Teams from './pages/Player/Teams/Teams'
import TournamentDetail from './pages/Player/TournamentDetail/TournamentDetail'
import Tournaments from './pages/Player/Tournaments/Tournaments'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    path: '/joueur',
    element: (
      <ProtectedRoute>
        <PlayerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="tournois" replace /> },
      { path: 'tournois', element: <Tournaments /> },
      { path: 'tournois/:id', element: <TournamentDetail /> },
      { path: 'equipes', element: <Teams /> },
      { path: 'profil', element: <Profile /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute admin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="tournois" replace /> },
      { path: 'tournois', element: <AdminTournaments /> },
      { path: 'tournois/:id', element: <AdminTournament /> },
      { path: 'jeux', element: <AdminGames /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
