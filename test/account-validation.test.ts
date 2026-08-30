import { describe, expect, test } from 'bun:test'
import { validatePasswordChange, validateProfileName } from '../src/lib/account-validation'

describe('account validation', () => {
  test('accepts a trimmed profile name up to 100 characters', () => {
    expect(validateProfileName('  Ada Lovelace  ')).toBeUndefined()
    expect(validateProfileName('a'.repeat(100))).toBeUndefined()
  })

  test('rejects blank and overlong profile names', () => {
    expect(validateProfileName('   ')).toBe('required')
    expect(validateProfileName('a'.repeat(101))).toBe('tooLong')
  })

  test('validates password requirements and confirmation', () => {
    expect(validatePasswordChange('', '', '')).toBe('currentRequired')
    expect(validatePasswordChange('current', '', '')).toBe('newRequired')
    expect(validatePasswordChange('current', 'short', 'short')).toBe('tooShort')
    expect(validatePasswordChange('current', 'long-enough', 'different')).toBe('mismatch')
    expect(validatePasswordChange('current', 'long-enough', 'long-enough')).toBeUndefined()
  })
})
