import { Effect } from 'effect'
import { Schema } from '@effect/schema'
import { AuthPayloadSchema, UserSchema, type AuthPayload } from '../domain/auth.schema'
import { ApiError, NetworkError, apiUrl, authRequest, TokenStorage, type DecodeError } from './api-client'

const persistAuth = (payload: AuthPayload) => {
  TokenStorage.set()
  localStorage.setItem('grocery_user', JSON.stringify(payload.user))
  return payload
}

const authCall = (path: string, body: Record<string, string>): Effect.Effect<AuthPayload, ApiError | NetworkError | DecodeError> =>
  Effect.tryPromise({
    try: async () => Schema.decodeUnknownSync(AuthPayloadSchema)(await authRequest(`/api/auth/${path}`, { method: 'POST', body: JSON.stringify(body) })),
    catch: (err) => err instanceof ApiError ? err : new NetworkError({ message: err instanceof Error ? err.message : 'Authentication failed' })
  }).pipe(Effect.map(persistAuth))

export const AuthService = {
  login: (email: string, password: string) => authCall('sign-in/email', { email, password }),

  register: (email: string, password: string, name: string) => authCall('sign-up/email', { email, password, name }),

  logout: (): void => {
    void fetch(apiUrl('/api/auth/sign-out'), { method: 'POST', credentials: 'include' })
    TokenStorage.remove()
    localStorage.removeItem('grocery_user')
  },

  getCurrentUser: (): { token: string; user: AuthPayload['user'] } | null => {
    const rawUser = localStorage.getItem('grocery_user')
    const marker = TokenStorage.get()
    if (!marker || !rawUser) return null
    try {
      return { token: marker, user: Schema.decodeUnknownSync(UserSchema)(JSON.parse(rawUser)) }
    } catch {
      TokenStorage.remove()
      localStorage.removeItem('grocery_user')
      return null
    }
  }
}
