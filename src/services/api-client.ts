import { Effect, Data } from 'effect'
import { Schema } from '@effect/schema'
import { ApiResponseSchema } from '../domain/auth.schema'

export class ApiError extends Data.TaggedError('ApiError')<{
  readonly code: string
  readonly message: string
  readonly status?: number
}> {}

export class NetworkError extends Data.TaggedError('NetworkError')<{
  readonly message: string
}> {}

export class DecodeError extends Data.TaggedError('DecodeError')<{
  readonly message: string
}> {}

const TOKEN_KEY = 'grocery_auth_token'

export const TokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY)
}

/** Callback invoked on 401 responses. Set by useAuth to trigger logout. */
let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function request<A, I>(
  url: string,
  options: RequestInit,
  responseSchema: Schema.Schema<A, I, never>
): Effect.Effect<A, ApiError | NetworkError | DecodeError> {
  return Effect.gen(function* () {
    const token = TokenStorage.get()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          ...options,
          headers
        }),
      catch: (err) => new NetworkError({ message: err instanceof Error ? err.message : 'Network error' })
    })

    // Handle 401 Unauthorized — token expired or invalid
    if (response.status === 401) {
      onUnauthorized?.()
      return yield* Effect.fail(
        new ApiError({
          code: 'UNAUTHORIZED',
          message: 'Session expired. Please log in again.',
          status: 401
        })
      )
    }

    const rawJson = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: () => new NetworkError({ message: 'Failed to parse JSON response' })
    })

    const envelopeSchema = ApiResponseSchema(responseSchema)
    const decoded = yield* Schema.decodeUnknown(envelopeSchema)(rawJson).pipe(
      Effect.mapError((err) => new DecodeError({ message: err.message }))
    )

    if (!decoded.success || decoded.data === undefined) {
      return yield* Effect.fail(
        new ApiError({
          code: decoded.error?.code || 'UNKNOWN_ERROR',
          message: decoded.error?.message || 'Unknown server error',
          status: response.status
        })
      )
    }

    return decoded.data as A
  })
}
