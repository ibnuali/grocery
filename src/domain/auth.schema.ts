import { Schema } from '@effect/schema'

export const UserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  created_at: Schema.optional(Schema.String)
})
export type User = Schema.Schema.Type<typeof UserSchema>

export const AuthPayloadSchema = Schema.Struct({
  token: Schema.optional(Schema.String),
  user: UserSchema
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
