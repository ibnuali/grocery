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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

const AUTH_MARKER_KEY = 'grocery_authenticated'

export const TokenStorage = {
  get: () => localStorage.getItem(AUTH_MARKER_KEY),
  set: () => localStorage.setItem(AUTH_MARKER_KEY, 'true'),
  remove: () => localStorage.removeItem(AUTH_MARKER_KEY)
}

function normalizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeKeys)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      normalizeKeys(child)
    ]))
  }
  return value
}

export async function authRequest(url: string, options: RequestInit): Promise<unknown> {
  const response = await fetch(apiUrl(url), {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> | undefined) }
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = body as { message?: string; error?: { message?: string }; code?: string }
    throw new ApiError({ code: error.code || 'AUTH_ERROR', message: error.message || error.error?.message || 'Authentication failed', status: response.status })
  }
  return body
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
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined)
    }

    const response = yield* Effect.tryPromise({
      try: () => fetch(apiUrl(url), { ...options, headers, credentials: 'include' }),
      catch: (err) => new NetworkError({ message: err instanceof Error ? err.message : 'Network error' })
    })

    if (response.status === 204) return undefined as A

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
    const decoded = yield* Schema.decodeUnknown(envelopeSchema)(normalizeKeys(rawJson)).pipe(
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
