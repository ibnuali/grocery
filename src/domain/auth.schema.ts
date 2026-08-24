import { Schema } from '@effect/schema'

export const UserSchema = Schema.Struct({
  id: Schema.String,
  username: Schema.String,
  full_name: Schema.String,
  created_at: Schema.String
})
export type User = Schema.Schema.Type<typeof UserSchema>

export const HouseholdSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  created_at: Schema.String
})
export type Household = Schema.Schema.Type<typeof HouseholdSchema>

export const AuthPayloadSchema = Schema.Struct({
  token: Schema.String,
  user: UserSchema,
  household: HouseholdSchema
})
export type AuthPayload = Schema.Schema.Type<typeof AuthPayloadSchema>

export const ApiResponseSchema = <T extends Schema.Schema.AnyNoContext>(dataSchema: T) =>
  Schema.Struct({
    success: Schema.Boolean,
    data: Schema.optional(dataSchema),
    error: Schema.optional(
      Schema.Struct({
        code: Schema.String,
        message: Schema.String
      })
    )
  })
