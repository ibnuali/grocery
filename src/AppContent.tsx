import React, { useState } from 'react'
import { Effect } from 'effect'
import { useAuth } from './hooks/useAuth'
import { LoginView } from './views/LoginView'
import { PlanListView } from './views/PlanListView'
import { PlanDetailView } from './views/PlanDetailView'
import { InStoreView } from './views/InStoreView'
import { ReconciliationView } from './views/ReconciliationView'
import { PlanService } from './services/PlanService'
import type { ShoppingPlan } from './domain/plan.schema'

type ActiveView = 'list' | 'detail' | 'instore' | 'reconciliation'

export const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user, household } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('list')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [activePlan, setActivePlan] = useState<ShoppingPlan | null>(null)

  const loadPlanDetails = async (planId: string) => {
    const prog = PlanService.getPlan(planId).pipe(
      Effect.map((plan) => {
        setActivePlan(plan)
      }),
      Effect.catchAll(() => {
        return Effect.succeed(undefined)
      })
    )
    await Effect.runPromise(prog)
  }

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId)
    await loadPlanDetails(planId)
    setActiveView('detail')
  }

  const handleAddItem = async (item: {
    itemName: string
    qty: number
    unit: string
    estimatedPrice: number
    category: string
  }) => {
    if (!selectedPlanId) return
    const prog = PlanService.addItem(
      selectedPlanId,
      item.itemName,
      item.qty,
      item.unit,
      item.estimatedPrice,
      item.category
    ).pipe(
      Effect.map(() => {
        loadPlanDetails(selectedPlanId)
      }),
      Effect.catchAll(() => Effect.succeed(undefined))
    )
    await Effect.runPromise(prog)
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedPlanId) return
    const prog = PlanService.deleteItem(selectedPlanId, itemId).pipe(
      Effect.map(() => {
        loadPlanDetails(selectedPlanId)
      }),
      Effect.catchAll(() => Effect.succeed(undefined))
    )
    await Effect.runPromise(prog)
  }

  if (!isAuthenticated) {
    return <LoginView />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top App Header */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-20">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">
              Grocery Planner
            </span>
          </div>
          <div className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{user?.full_name}</span>
            <span className="mx-1.5">•</span>
            <span className="text-slate-400">{household?.name}</span>
          </div>
        </div>
      </header>

      {/* Main Views */}
      <main>
        {activeView === 'list' && (
          <PlanListView
            onSelectPlan={handleSelectPlan}
            onLogout={logout}
          />
        )}

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
            onBack={() => {
              loadPlanDetails(activePlan.id)
              setActiveView('detail')
            }}
            onProceedToReconcile={() => {
              loadPlanDetails(activePlan.id)
              setActiveView('reconciliation')
            }}
          />
        )}

        {activeView === 'reconciliation' && activePlan && (
          <ReconciliationView
            plan={activePlan}
            onSuccess={(updated) => {
              setActivePlan(updated)
              setActiveView('detail')
            }}
            onBack={() => setActiveView('detail')}
          />
        )}
      </main>
    </div>
  )
}
