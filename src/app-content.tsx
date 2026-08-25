import React, { useCallback, useEffect, useState } from 'react'
import { Effect } from 'effect'
import { useAuth } from './hooks/use-auth'
import { useToast } from './hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { UserMenu } from './components/user-menu'
import { MobileBottomNav } from './components/mobile-bottom-nav'
import { LoginView } from './views/login-view'
import { PlanListView } from './views/plan-list-view'
import { PlanDetailView, PlanDetailSkeleton } from './views/plan-detail-view'
import { InStoreView } from './views/in-store-view'
import { ReconciliationView } from './views/reconciliation-view'
import { PlanService } from './services/plan-service'
import type { ShoppingPlan } from './domain/plan.schema'

type ActiveView = 'list' | 'detail' | 'instore' | 'reconciliation'
type AppRoute = { view: ActiveView; planId?: string }

const parseRoute = (): AppRoute => {
  const segments = window.location.pathname.split('/').filter(Boolean)
  if (segments[0] !== 'plans' || !segments[1]) return { view: 'list' }

  let planId: string
  try {
    planId = decodeURIComponent(segments[1])
  } catch {
    return { view: 'list' }
  }

  if (segments[2] === 'shop') return { view: 'instore', planId }
  if (segments[2] === 'reconcile') return { view: 'reconciliation', planId }
  return { view: 'detail', planId }
}

const routePath = (route: AppRoute) => {
  if (route.view === 'list' || !route.planId) return '/plans'
  const suffix = route.view === 'instore' ? '/shop' : route.view === 'reconciliation' ? '/reconcile' : ''
  return `/plans/${encodeURIComponent(route.planId)}${suffix}`
}

export const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [route, setRoute] = useState<AppRoute>(() => parseRoute())
  const [activePlan, setActivePlan] = useState<ShoppingPlan | null>(null)

  const navigate = useCallback((nextRoute: AppRoute, replace = false) => {
    const nextPath = routePath(nextRoute)
    if (window.location.pathname !== nextPath) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', nextPath)
    }
    setRoute(nextRoute)
  }, [])

  const loadPlanDetails = useCallback(async (planId: string) => {
    const prog = PlanService.getPlan(planId).pipe(
      Effect.map((plan) => setActivePlan(plan)),
      Effect.catchAll(() => {
        toast(t('planDetail.errorLoad'), 'error')
        navigate({ view: 'list' }, true)
        return Effect.succeed(undefined)
      })
    )
    await Effect.runPromise(prog)
  }, [navigate, t, toast])

  useEffect(() => {
    if (route.view !== 'list' && route.planId && activePlan?.id !== route.planId) void loadPlanDetails(route.planId)
  }, [activePlan?.id, loadPlanDetails, route.planId, route.view])

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleAddItem = async (item: { itemName: string; qty: number; unit: string; estimatedPrice: number; category: string }) => {
    if (!route.planId) return
    const prog = PlanService.addItem(route.planId, item.itemName, item.qty, item.unit, item.estimatedPrice, item.category).pipe(
      Effect.map(() => loadPlanDetails(route.planId!)),
      Effect.catchAll(() => { toast(t('planDetail.errorAdd'), 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!route.planId) return
    const prog = PlanService.deleteItem(route.planId, itemId).pipe(
      Effect.map(() => loadPlanDetails(route.planId!)),
      Effect.catchAll(() => { toast(t('planDetail.errorDelete'), 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  if (!isAuthenticated) return <LoginView />

  const activeRoutePlan = route.view !== 'list' && activePlan?.id === route.planId ? activePlan : null
  const goToPlan = (view: Exclude<ActiveView, 'list'>) => {
    if (route.planId) navigate({ view, planId: route.planId })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 'var(--z-sticky)', borderBottom: '1.5px solid var(--color-rule)', background: 'var(--color-paper)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate({ view: 'list' })} aria-label={t('navigation.plans')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: 0, padding: 0, background: 'transparent', cursor: 'pointer' }}>
            <span aria-hidden="true" style={{ height: '0.5rem', width: '0.5rem', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 4s ease-in-out infinite' }} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>Grocery Planner</span>
          </button>
          {user && <UserMenu user={user} onLogout={logout} />}
        </div>
      </header>

      <main className="app-main">
        {route.view === 'list' && <PlanListView onSelectPlan={(planId) => navigate({ view: 'detail', planId })} onLogout={logout} />}
        {route.view === 'detail' && (activeRoutePlan ? <PlanDetailView planTitle={activeRoutePlan.title} shoppingDate={activeRoutePlan.shopping_date ? activeRoutePlan.shopping_date.substring(0, 10) : ''} budgetTarget={Number(activeRoutePlan.budget_target)} items={activeRoutePlan.items ?? []} onAddItem={handleAddItem} onDeleteItem={handleDeleteItem} onStartShopping={() => goToPlan('instore')} onReconcile={() => goToPlan('reconciliation')} onBack={() => navigate({ view: 'list' })} /> : <PlanDetailSkeleton />)}
        {route.view === 'instore' && activeRoutePlan && <InStoreView planId={activeRoutePlan.id} planTitle={activeRoutePlan.title} initialItems={activeRoutePlan.items ?? []} onBack={() => { void loadPlanDetails(activeRoutePlan.id); navigate({ view: 'detail', planId: activeRoutePlan.id }) }} onProceedToReconcile={() => { void loadPlanDetails(activeRoutePlan.id); navigate({ view: 'reconciliation', planId: activeRoutePlan.id }) }} />}
        {route.view === 'reconciliation' && activeRoutePlan && <ReconciliationView plan={activeRoutePlan} onSuccess={(updated) => { setActivePlan(updated); navigate({ view: 'detail', planId: updated.id }) }} onBack={() => { void loadPlanDetails(activeRoutePlan.id); navigate({ view: 'detail', planId: activeRoutePlan.id }) }} />}
      </main>

      <MobileBottomNav activeView={route.view} planId={route.planId} onNavigate={(view) => { if (view === 'list') navigate({ view: 'list' }); else goToPlan(view) }} />
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }`}</style>
    </div>
  )
}
