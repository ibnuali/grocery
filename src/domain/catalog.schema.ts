import { Schema } from '@effect/schema'

export const MasterItemSchema = Schema.Struct({
  id: Schema.String,
  household_id: Schema.String,
  name: Schema.String,
  category: Schema.String,
  latest_price: Schema.Union(Schema.String, Schema.Number),
  created_at: Schema.String,
  updated_at: Schema.String
})

export type MasterItem = Schema.Schema.Type<typeof MasterItemSchema>

export const MasterItemListSchema = Schema.Array(MasterItemSchema)
