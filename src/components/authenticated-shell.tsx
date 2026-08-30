import React from 'react'
import { Link, Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserMenu } from './user-menu'
import { PlanListView } from '../views/plan-list-view'
import { PlanRoute } from '../routes/plan-route'
import { planDetailPath } from '../lib/routes'
import type { User } from '../domain/auth.schema'

interface AuthenticatedShellProps {
  logout: () => void
  user: User | null
}

export const AuthenticatedShell: React.FC<AuthenticatedShellProps> = ({ logout, user }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isInStore = !!useMatch('/plans/:planId/shop')

  return (
    <div style={{ minHeight: '100vh', background: isInStore ? 'var(--color-paper-2)' : 'var(--color-paper)', color: 'var(--color-ink)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 'calc(var(--z-sticky) + 1)', borderBottom: '1.5px solid var(--color-rule)', background: 'var(--color-paper)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/plans" aria-label={t('navigation.plans')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 0, padding: 0, background: 'transparent', cursor: 'pointer', textDecoration: 'none' }}>
            <span aria-hidden="true" style={{ height: '0.5rem', width: '0.5rem', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 4s ease-in-out infinite' }} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Grocery Planner</span>
          </Link>
          {user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/plans" element={<PlanListView onSelectPlan={(planId) => navigate(planDetailPath(planId))} onLogout={logout} />} />
          <Route path="/plans/:planId" element={<PlanRoute view="detail" />} />
          <Route path="/plans/:planId/shop" element={<PlanRoute view="instore" />} />
          <Route path="/plans/:planId/reconcile" element={<PlanRoute view="reconciliation" />} />
          <Route path="*" element={<Navigate replace to="/plans" />} />
        </Routes>
      </main>
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }`}</style>
    </div>
  )
}
