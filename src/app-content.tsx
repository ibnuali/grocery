import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/use-auth'
import { LoginView } from './views/login-view'
import { LoginPage } from './views/login-page'
import { AuthenticatedShell } from './components/authenticated-shell'
import { publicAuthMode } from './lib/routes'

export const AppContent: React.FC = () => {
  const { isAuthenticated, logout, updateUser, user } = useAuth()
  const location = useLocation()
  const authMode = publicAuthMode(location.pathname)

  if (!isAuthenticated) {
    if (authMode) return <LoginPage mode={authMode} />
    return <LoginView />
  }

  if (location.pathname === '/' || authMode) {
    return <Navigate replace to="/plans" />
  }

  return <AuthenticatedShell logout={logout} user={user} onUserUpdated={updateUser} />
}
