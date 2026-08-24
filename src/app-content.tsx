import React, { useState } from 'react'
import { Effect } from 'effect'
import { useAuth } from './hooks/use-auth'
import { useToast } from './hooks/use-toast'
import { ThemeToggle } from './components/theme-toggle'
import { LoginView } from './views/login-view'
import { PlanListView } from './views/plan-list-view'
import { PlanDetailView } from './views/plan-detail-view'
import { InStoreView } from './views/in-store-view'
import { ReconciliationView } from './views/reconciliation-view'
import { PlanService } from './services/plan-service'
import type { ShoppingPlan } from './domain/plan.schema'

type ActiveView = 'list' | 'detail' | 'instore' | 'reconciliation'

export const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user, household } = useAuth()
  const { toast } = useToast()
  const [activeView, setActiveView] = useState<ActiveView>('list')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [activePlan, setActivePlan] = useState<ShoppingPlan | null>(null)

  const loadPlanDetails = async (planId: string) => {
    const prog = PlanService.getPlan(planId).pipe(
      Effect.map((plan) => { setActivePlan(plan) }),
      Effect.catchAll(() => { toast('Gagal memuat detail rencana', 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId)
    await loadPlanDetails(planId)
    setActiveView('detail')
  }

  const handleAddItem = async (item: { itemName: string; qty: number; unit: string; estimatedPrice: number; category: string }) => {
    if (!selectedPlanId) return
    const prog = PlanService.addItem(selectedPlanId, item.itemName, item.qty, item.unit, item.estimatedPrice, item.category).pipe(
      Effect.map(() => { loadPlanDetails(selectedPlanId) }),
      Effect.catchAll(() => { toast('Gagal menambahkan item', 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedPlanId) return
    const prog = PlanService.deleteItem(selectedPlanId, itemId).pipe(
      Effect.map(() => { loadPlanDetails(selectedPlanId) }),
      Effect.catchAll(() => { toast('Gagal menghapus item', 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  if (!isAuthenticated) return <LoginView />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-paper)', color: 'var(--color-ink)' }}>
      {/* App Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 'var(--z-sticky)', borderBottom: '1.5px solid var(--color-rule)', background: 'var(--color-paper-glass)', backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Character mark — small pulsing dot */}
            <span style={{ height: '0.5rem', width: '0.5rem', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 4s ease-in-out infinite' }} />
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>
              Grocery Planner
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{user?.full_name}</span>
              <span style={{ margin: '0 0.375rem', color: 'var(--color-rule)' }}>•</span>
              <span>{household?.name}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Views */}
      <main>
        {activeView === 'list' && <PlanListView onSelectPlan={handleSelectPlan} onLogout={logout} />}
        {activeView === 'detail' && activePlan && (
          <PlanDetailView
            planTitle={activePlan.title}
            shoppingDate={activePlan.shopping_date ? activePlan.shopping_date.substring(0, 10) : ''}
            budgetTarget={Number(activePlan.budget_target)}
            items={activePlan.items ?? []}
            onAddItem={handleAddItem}
            onDeleteItem={handleDeleteItem}
            onStartShopping={() => setActiveView('instore')}
            onReconcile={() => setActiveView('reconciliation')}
            onBack={() => setActiveView('list')}
          />
        )}
        {activeView === 'instore' && activePlan && (
          <InStoreView
            planId={activePlan.id}
            planTitle={activePlan.title}
            initialItems={activePlan.items ?? []}
            onBack={() => { loadPlanDetails(activePlan.id); setActiveView('detail') }}
            onProceedToReconcile={() => { loadPlanDetails(activePlan.id); setActiveView('reconciliation') }}
          />
        )}
        {activeView === 'reconciliation' && activePlan && (
          <ReconciliationView
            plan={activePlan}
            onSuccess={(updated) => { setActivePlan(updated); setActiveView('detail') }}
            onBack={() => { loadPlanDetails(activePlan.id); setActiveView('detail') }}
          />
        )}
      </main>

      {/* Pulse keyframe for character mark */}
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.7; } }`}</style>
    </div>
  )
}
