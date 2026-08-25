import { Effect } from 'effect'
import { ShoppingPlanSchema, type ShoppingPlan } from '../domain/plan.schema'
import { request, type ApiError, type NetworkError, type DecodeError } from './api-client'

export interface PlannedItemReconcile {
  id: string
  actual_price: string
  is_skipped: boolean
}

export interface UnplannedItemReconcile {
  item_name: string
  category: string
  qty: number
  unit: string
  actual_price: string
}

export const ReconciliationService = {
  reconcile: (
    planId: string,
    plannedItems: PlannedItemReconcile[],
    unplannedItems: UnplannedItemReconcile[]
  ): Effect.Effect<ShoppingPlan, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}/reconcile-receipt`,
      {
        method: 'POST',
        body: JSON.stringify({
          planned_items: plannedItems,
          unplanned_items: unplannedItems
        })
      },
      ShoppingPlanSchema
    )
}
