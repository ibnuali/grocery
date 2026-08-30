import { describe, expect, test } from 'bun:test'
import { isShoppingComplete } from '../src/domain/plan-status'

const item = (is_checked: boolean) => ({ is_checked })

describe('isShoppingComplete', () => {
  test('allows reconciliation when every shopping item is checked', () => {
    expect(isShoppingComplete('DRAFT', [item(true), item(true)])).toBe(true)
  })

  test('blocks reconciliation while any shopping item is unchecked', () => {
    expect(isShoppingComplete('DRAFT', [item(true), item(false)])).toBe(false)
  })

  test('does not treat an empty draft plan as shop-complete', () => {
    expect(isShoppingComplete('DRAFT', [])).toBe(false)
  })

  test('allows already completed plans to reconcile again', () => {
    expect(isShoppingComplete('COMPLETED', [])).toBe(true)
  })
})
