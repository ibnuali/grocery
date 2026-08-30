import { Effect } from 'effect'
import { PasswordChangeResultSchema, SafeUserSchema, type PasswordChangeResult, type SafeUser } from '../domain/account.schema'
import { request, type ApiError, type DecodeError, type NetworkError } from './api-client'

export type AccountServiceError = ApiError | NetworkError | DecodeError

export const AccountService = {
  getProfile: (): Effect.Effect<SafeUser, AccountServiceError> =>
    request('/api/v1/account/profile', { method: 'GET' }, SafeUserSchema),

  updateProfile: (name: string): Effect.Effect<SafeUser, AccountServiceError> =>
    request(
      '/api/v1/account/profile',
      { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) },
      SafeUserSchema
    ),

  changePassword: (currentPassword: string, newPassword: string): Effect.Effect<PasswordChangeResult, AccountServiceError> =>
    request(
      '/api/v1/account/password',
      { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) },
      PasswordChangeResultSchema
    )
}
