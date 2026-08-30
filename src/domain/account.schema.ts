import { Schema } from '@effect/schema'
import { UserSchema } from './auth.schema'

export const SafeUserSchema = UserSchema
export type SafeUser = Schema.Schema.Type<typeof SafeUserSchema>

export const PasswordChangeResultSchema = Schema.Struct({
  changed: Schema.Boolean
})
export type PasswordChangeResult = Schema.Schema.Type<typeof PasswordChangeResultSchema>
