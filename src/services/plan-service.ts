import { Effect } from 'effect'
import { Schema } from '@effect/schema'
import {
  ShoppingPlanSchema,
  ShoppingPlanPageSchema,
  PlanItemSchema,
  type ShoppingPlan,
  type ShoppingPlanPage,
  type PlanItem
} from '../domain/plan.schema'
import { request, type ApiError, type NetworkError, type DecodeError } from './api-client'

export const PlanService = {
  listPlans: (cursor?: string, limit = 20): Effect.Effect<ShoppingPlanPage, ApiError | NetworkError | DecodeError> => {
    const params = new URLSearchParams({ limit: String(limit) })
    if (cursor) params.set('cursor', cursor)
    return request(`/api/v1/plans?${params.toString()}`, { method: 'GET' }, ShoppingPlanPageSchema)
  },

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
          budget_target: String(budgetTarget),
          shopping_date: shoppingDate || new Date().toISOString().split('T')[0]
        })
      },
      ShoppingPlanSchema
    ),

  updatePlan: (
    planId: string,
    title: string,
    budgetTarget: number,
    shoppingDate: string
  ): Effect.Effect<ShoppingPlan, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          budget_target: String(budgetTarget),
          shopping_date: shoppingDate
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
    category = 'General',
    isUnplanned = false
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
          category,
          is_unplanned: isUnplanned
        })
      },
      PlanItemSchema
    ),

  deleteItem: (planId: string, itemId: string): Effect.Effect<void, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}/items/${itemId}`,
      { method: 'DELETE' },
      Schema.Struct({})
    ),

  checkItem: (planId: string, itemId: string, isChecked: boolean): Effect.Effect<{ item_id: string; is_checked: boolean }, ApiError | NetworkError | DecodeError> =>
    request(
      `/api/v1/plans/${planId}/items/${itemId}/check`,
      {
        method: 'PATCH',
        body: JSON.stringify({ is_checked: isChecked })
      },
      Schema.Struct({ item_id: Schema.String, is_checked: Schema.Boolean })
    )
}
