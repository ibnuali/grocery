import { describe, expect, test } from 'bun:test'
import { planDetailPath, planReconciliationPath, planShopPath } from '../src/lib/routes'

describe('plan route builders', () => {
  test('encode plan IDs in detail and nested paths', () => {
    const planId = 'plan/with spaces'

    expect(planDetailPath(planId)).toBe('/plans/plan%2Fwith%20spaces')
    expect(planShopPath(planId)).toBe('/plans/plan%2Fwith%20spaces/shop')
    expect(planReconciliationPath(planId)).toBe('/plans/plan%2Fwith%20spaces/reconcile')
  })
})
