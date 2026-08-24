import { Effect } from 'effect'
import { Schema } from '@effect/schema'
import { AuthPayloadSchema, UserSchema, HouseholdSchema, type AuthPayload } from '../domain/auth.schema'
import { request, TokenStorage, type ApiError, type NetworkError, type DecodeError } from './ApiClient'

export const AuthService = {
  login: (username: string, password: string): Effect.Effect<AuthPayload, ApiError | NetworkError | DecodeError> =>
    Effect.gen(function* () {
      const payload = yield* request(
        '/api/v1/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username, password })
        },
        AuthPayloadSchema
      )
      TokenStorage.set(payload.token)
      localStorage.setItem('grocery_user', JSON.stringify(payload.user))
      localStorage.setItem('grocery_household', JSON.stringify(payload.household))
      return payload
    }),

  register: (
    username: string,
    password: string,
    fullName: string,
    householdName?: string
  ): Effect.Effect<AuthPayload, ApiError | NetworkError | DecodeError> =>
    Effect.gen(function* () {
      const payload = yield* request(
        '/api/v1/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            full_name: fullName,
            household_name: householdName || ''
          })
        },
        AuthPayloadSchema
      )
      TokenStorage.set(payload.token)
      localStorage.setItem('grocery_user', JSON.stringify(payload.user))
      localStorage.setItem('grocery_household', JSON.stringify(payload.household))
      return payload
    }),

  logout: (): void => {
    TokenStorage.remove()
    localStorage.removeItem('grocery_user')
    localStorage.removeItem('grocery_household')
  },

  getCurrentUser: (): { token: string; user: AuthPayload['user']; household: AuthPayload['household'] } | null => {
    const rawUser = localStorage.getItem('grocery_user')
    const rawHousehold = localStorage.getItem('grocery_household')
    const token = TokenStorage.get()
    if (!token || !rawUser || !rawHousehold) return null
    try {
      const user = Schema.decodeUnknownSync(UserSchema)(JSON.parse(rawUser))
      const household = Schema.decodeUnknownSync(HouseholdSchema)(JSON.parse(rawHousehold))
      return { token, user, household }
    } catch {
      // Corrupt storage — clear it
      TokenStorage.remove()
      localStorage.removeItem('grocery_user')
      localStorage.removeItem('grocery_household')
      return null
    }
  }
}
