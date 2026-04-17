import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}