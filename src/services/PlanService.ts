import { Effect } from 'effect'
import {
  ShoppingPlanSchema,
  ShoppingPlanListSchema,
  PlanItemSchema,
  type ShoppingPlan,
  type PlanItem
} from '../domain/plan.schema'
import { request, type ApiError, type NetworkError, type DecodeError } from './ApiClient'

export const PlanService = {
  listPlans: (): Effect.Effect<readonly ShoppingPlan[], ApiError | NetworkError | DecodeError> =>
    request('/api/v1/plans', { method: 'GET' }, ShoppingPlanListSchema),

  getPlan: (id: string): Effect.Effect<ShoppingPlan, ApiError | NetworkError | DecodeError> =>
    request(`/api/v1/plans/${id}`, { method: 'GET' }, ShoppingPlanSchema),

  createPlan: (
    title: string,
    budgetTarget: number,
    shoppingDate?: string
  ): Effect.Effect<ShoppingPlan, ApiError | NetworkError | DecodeError> =>
    request(
      '/api/v1/plans',
      {
        method: 'POST',
        body: JSON.stringify({
          title,
          budget_target: budgetTarget,
          shopping_date: shoppingDate || new Date().toISOString().split('T')[0]
        })
      },
      ShoppingPlanSchema
    ),

  addItem: (
    planId: string,
    itemName: string,
    qty: number,
    unit: string,
    estimatedPrice: number,
    category = 'General'
  ): Effect.Effect<PlanItem, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}/items`,
      {
        method: 'POST',
        body: JSON.stringify({
          item_name: itemName,
          qty,
          unit,
          estimated_price: estimatedPrice,
          category
        })
      },
      PlanItemSchema
    ),

  deleteItem: (planId: string, itemId: string): Effect.Effect<unknown, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}/items/${itemId}`,
      { method: 'DELETE' },
      PlanItemSchema
    ),

  checkItem: (planId: string, itemId: string, isChecked: boolean): Effect.Effect<PlanItem, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}/items/${itemId}/check`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_checked: isChecked })
      },
      PlanItemSchema
    )
}
