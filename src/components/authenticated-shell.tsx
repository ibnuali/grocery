import React from 'react'
import { Link, Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserMenu } from './user-menu'
import { PlanListView } from '../views/plan-list-view'
import { MobileBottomNav } from './mobile-bottom-nav'
import { SettingsView } from '../views/settings-view'
import { PlanRoute } from '../routes/plan-route'
import { planDetailPath } from '../lib/routes'
import type { User } from '../domain/auth.schema'

interface AuthenticatedShellProps {
  logout: () => void
  user: User | null
  onUserUpdated: (user: User) => void
}

export const AuthenticatedShell: React.FC<AuthenticatedShellProps> = ({ logout, user, onUserUpdated }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const isInStore = !!useMatch('/plans/:planId/shop')
  const settingsBackState = typeof location.state === 'object' && location.state && 'from' in location.state && typeof location.state.from === 'string'
    ? location.state.from
    : null
  const settingsBackPath = settingsBackState && settingsBackState !== '/settings' ? settingsBackState : '/plans'

  return (
    <div style={{ minHeight: '100vh', background: isInStore ? 'var(--color-paper-2)' : 'var(--color-paper)', color: 'var(--color-ink)' }}>
      <header className="authenticated-shell__header" style={{ position: 'sticky', top: 0, zIndex: 'calc(var(--z-sticky) + 1)', borderBottom: '1.5px solid var(--color-rule)', background: 'var(--color-paper)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/plans" aria-label={t('navigation.plans')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', textDecoration: 'none' }}>
            <span aria-hidden="true" style={{ height: '0.5rem', width: '0.5rem', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 4s ease-in-out infinite' }} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Grocery Planner</span>
          </Link>
          {user && <UserMenu user={user} onLogout={logout} onSettings={() => navigate('/settings', { state: { from: location.pathname } })} />}
        </div>
      </header>

      <main className="app-main authenticated-main">
        <Routes>
          <Route path="/plans" element={<PlanListView onSelectPlan={(planId) => navigate(planDetailPath(planId))} onLogout={logout} />} />
          <Route path="/plans/:planId" element={<PlanRoute view="detail" />} />
          <Route path="/plans/:planId/shop" element={<PlanRoute view="instore" />} />
          <Route path="/plans/:planId/reconcile" element={<PlanRoute view="reconciliation" />} />
          <Route path="/settings" element={user ? <SettingsView user={user} onUserUpdated={onUserUpdated} onBack={() => navigate(settingsBackPath, { replace: true })} onLogout={logout} /> : <Navigate replace to="/plans" />} />
          <Route path="*" element={<Navigate replace to="/plans" />} />
        </Routes>
      </main>
      <MobileBottomNav />
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }`}</style>
    </div>
  )
}
