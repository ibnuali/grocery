import React, { useCallback, useEffect, useState } from 'react'
import { Effect } from 'effect'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { PlanDetailView, PlanDetailSkeleton, type PlanDetailsUpdate } from '../views/plan-detail-view'
import { InStoreView, type InStoreItemInput } from '../views/in-store-view'
import { ReconciliationView } from '../views/reconciliation-view'
import { PlanService } from '../services/plan-service'
import { isShoppingComplete } from '../domain/plan-status'
import { planDetailPath, planReconciliationPath, planShopPath } from '../lib/routes'
import type { ShoppingPlan } from '../domain/plan.schema'

export type PlanRouteView = 'detail' | 'instore' | 'reconciliation'

export const PlanRoute: React.FC<{ view: PlanRouteView }> = ({ view }) => {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [activePlan, setActivePlan] = useState<ShoppingPlan | null>(null)

  const loadPlanDetails = useCallback(async (id: string) => {
    const prog = PlanService.getPlan(id).pipe(
      Effect.map((plan) => setActivePlan(plan)),
      Effect.catchAll(() => {
        toast(t('planDetail.errorLoad'), 'error')
        navigate('/plans', { replace: true })
        return Effect.succeed(undefined)
      })
    )
    await Effect.runPromise(prog)
  }, [navigate, t, toast])

  useEffect(() => {
    if (!planId) {
      navigate('/plans', { replace: true })
      return
    }
    if (activePlan?.id !== planId) void loadPlanDetails(planId)
  }, [activePlan?.id, loadPlanDetails, navigate, planId])

  useEffect(() => {
    if (view !== 'reconciliation' || !planId || activePlan?.id !== planId) return
    if (!isShoppingComplete(activePlan.status, activePlan.items)) {
      toast(t('reconciliation.unavailable'), 'error')
      navigate(planDetailPath(planId), { replace: true })
    }
  }, [activePlan, navigate, planId, t, toast, view])

  const handleAddItem = async (item: { itemName: string; qty: number; unit: string; estimatedPrice: number; category: string }) => {
    if (!planId) return
    const prog = PlanService.addItem(planId, item.itemName, item.qty, item.unit, item.estimatedPrice, item.category).pipe(
      Effect.map(() => loadPlanDetails(planId)),
      Effect.catchAll(() => { toast(t('planDetail.errorAdd'), 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  const handleAddUnplannedItem = async (item: InStoreItemInput) => {
    if (!planId) return null
    const prog = PlanService.addItem(planId, item.itemName, item.qty, item.unit, item.estimatedPrice, item.category, true).pipe(
      Effect.map((addedItem) => {
        setActivePlan((current) => current?.id === planId ? { ...current, items: [...(current.items ?? []), addedItem] } : current)
        return addedItem
      }),
      Effect.catchAll(() => { toast(t('inStore.errorAddUnplanned'), 'error'); return Effect.succeed(null) })
    )
    return await Effect.runPromise(prog)
  }

  const handleUpdatePlan = async (details: PlanDetailsUpdate): Promise<boolean> => {
    if (!planId) return false
    let succeeded = false
    const prog = PlanService.updatePlan(planId, details.title, details.budgetTarget, details.shoppingDate).pipe(
      Effect.map((updatedPlan) => {
        setActivePlan((current) => current?.id === updatedPlan.id ? { ...updatedPlan, items: current.items } : updatedPlan)
        succeeded = true
      }),
      Effect.catchAll(() => {
        toast(t('planDetail.errorUpdate'), 'error')
        return Effect.succeed(undefined)
      })
    )
    await Effect.runPromise(prog)
    return succeeded
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!planId) return
    const prog = PlanService.deleteItem(planId, itemId).pipe(
      Effect.map(() => loadPlanDetails(planId)),
      Effect.catchAll(() => { toast(t('planDetail.errorDelete'), 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  if (!planId || activePlan?.id !== planId) return <PlanDetailSkeleton />

  const canReconcile = isShoppingComplete(activePlan.status, activePlan.items)

  if (view === 'detail') {
    return (
      <PlanDetailView
        planTitle={activePlan.title}
        shoppingDate={activePlan.shopping_date ? activePlan.shopping_date.substring(0, 10) : ''}
        budgetTarget={Number(activePlan.budget_target)}
        items={activePlan.items ?? []}
        canReconcile={canReconcile}
        onUpdatePlan={handleUpdatePlan}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onStartShopping={() => navigate(planShopPath(planId))}
        onReconcile={() => navigate(planReconciliationPath(planId))}
        onBack={() => navigate('/plans')}
      />
    )
  }

  if (view === 'instore') {
    return (
      <InStoreView
        planId={activePlan.id}
        planTitle={activePlan.title}
        planStatus={activePlan.status}
        initialItems={activePlan.items ?? []}
        onAddUnplannedItem={handleAddUnplannedItem}
        onBack={() => { void loadPlanDetails(activePlan.id); navigate(planDetailPath(activePlan.id)) }}
        onProceedToReconcile={(items) => {
          setActivePlan((current) => current?.id === activePlan.id ? { ...current, items: [...items] } : current)
          navigate(planReconciliationPath(activePlan.id))
        }}
      />
    )
  }

  return (
    <ReconciliationView
      plan={activePlan}
      onSuccess={(updated) => { setActivePlan(updated); navigate(planDetailPath(updated.id)) }}
      onBack={() => { void loadPlanDetails(activePlan.id); navigate(planDetailPath(activePlan.id)) }}
    />
  )
}
