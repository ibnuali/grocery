import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/use-auth'
import { LoginView } from './views/login-view'
import { LoginPage } from './views/login-page'
import { AuthenticatedShell } from './components/authenticated-shell'

export const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    if (location.pathname === '/login') return <LoginPage />
    return <LoginView />
  }

  if (location.pathname === '/' || location.pathname === '/login') {
    return <Navigate replace to="/plans" />
  }

  return <AuthenticatedShell logout={logout} user={user} />
}
