import { Schema } from '@effect/schema'

export const PlanItemSchema = Schema.Struct({
  id: Schema.String,
  plan_id: Schema.String,
  master_item_id: Schema.optional(Schema.NullOr(Schema.String)),
  item_name: Schema.String,
  qty: Schema.Union(Schema.String, Schema.Number),
  unit: Schema.String,
  estimated_price: Schema.Union(Schema.String, Schema.Number),
  actual_price: Schema.optional(Schema.NullOr(Schema.Union(Schema.String, Schema.Number))),
  is_checked: Schema.Boolean,
  is_skipped: Schema.Boolean,
  is_unplanned: Schema.Boolean
})
export type PlanItem = Schema.Schema.Type<typeof PlanItemSchema>

export const ShoppingPlanSchema = Schema.Struct({
  id: Schema.String,
  user_id: Schema.String,
  title: Schema.String,
  budget_target: Schema.Union(Schema.String, Schema.Number),
  status: Schema.String,
  shopping_date: Schema.String,
  items: Schema.optional(Schema.Array(PlanItemSchema)),
  created_at: Schema.optional(Schema.String)
})
export type ShoppingPlan = Schema.Schema.Type<typeof ShoppingPlanSchema>

export const ShoppingPlanPageSchema = Schema.Struct({
  items: Schema.Array(ShoppingPlanSchema),
  next_cursor: Schema.NullOr(Schema.String)
})
export type ShoppingPlanPage = Schema.Schema.Type<typeof ShoppingPlanPageSchema>
