import { describe, expect, test } from 'bun:test'
import { planDetailPath, planReconciliationPath, planShopPath, publicAuthMode } from '../src/lib/routes'

describe('plan route builders', () => {
  test('encode plan IDs in detail and nested paths', () => {
    const planId = 'plan/with spaces'

    expect(planDetailPath(planId)).toBe('/plans/plan%2Fwith%20spaces')
    expect(planShopPath(planId)).toBe('/plans/plan%2Fwith%20spaces/shop')
    expect(planReconciliationPath(planId)).toBe('/plans/plan%2Fwith%20spaces/reconcile')
  })
})

describe('public auth routes', () => {
  test('maps dedicated login and register paths to explicit auth modes', () => {
    expect(publicAuthMode('/login')).toBe('login')
    expect(publicAuthMode('/register')).toBe('register')
    expect(publicAuthMode('/')).toBeNull()
  })
})
