import { afterEach, describe, expect, test } from 'bun:test'
import { Effect } from 'effect'
import { AccountService } from '../src/services/account-service'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('account service', () => {
  test('gets the safe current profile through the standard envelope', async () => {
    let request: Request | undefined
    globalThis.fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : input
      request = new Request(new URL(url, 'http://localhost'), init)
      return new Response(JSON.stringify({ success: true, data: { id: 'u1', name: 'Ada', email: 'ada@example.com' } }))
    }

    const profile = await Effect.runPromise(AccountService.getProfile())

    expect(request?.url).toContain('/api/v1/account/profile')
    expect(request?.method).toBe('GET')
    expect(profile.name).toBe('Ada')
  })

  test('updates the profile with only the name field', async () => {
    let request: Request | undefined
    globalThis.fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : input
      request = new Request(new URL(url, 'http://localhost'), init)
      return new Response(JSON.stringify({ success: true, data: { id: 'u1', name: 'New Name', email: 'ada@example.com' } }))
    }

    const profile = await Effect.runPromise(AccountService.updateProfile('New Name'))
    const body = await request?.json()

    expect(request?.method).toBe('PATCH')
    expect(body).toEqual({ name: 'New Name' })
    expect(profile.name).toBe('New Name')
  })

  test('changes the password without adding confirmation to the request', async () => {
    let request: Request | undefined
    globalThis.fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : input
      request = new Request(new URL(url, 'http://localhost'), init)
      return new Response(JSON.stringify({ success: true, data: { changed: true } }))
    }

    const result = await Effect.runPromise(AccountService.changePassword('current', 'new-password'))
    const body = await request?.json()

    expect(request?.method).toBe('POST')
    expect(body).toEqual({ currentPassword: 'current', newPassword: 'new-password' })
    expect(result.changed).toBe(true)
  })
})
