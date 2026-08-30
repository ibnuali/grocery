import { describe, expect, test } from 'bun:test'
import { isCreatePlanRequest, isMobileNavigationActive } from '../src/lib/mobile-navigation'

describe('mobile navigation', () => {
  test('marks plan routes active and settings routes as profile', () => {
    expect(isMobileNavigationActive('plans', '/plans')).toBe(true)
    expect(isMobileNavigationActive('plans', '/plans/weekly/shop')).toBe(true)
    expect(isMobileNavigationActive('profile', '/settings')).toBe(true)
    expect(isMobileNavigationActive('profile', '/plans')).toBe(false)
  })

  test('recognizes only the create-plan query request', () => {
    expect(isCreatePlanRequest('?create=1')).toBe(true)
    expect(isCreatePlanRequest('?create=0')).toBe(false)
    expect(isCreatePlanRequest('?foo=1')).toBe(false)
  })
})
