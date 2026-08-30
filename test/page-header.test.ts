import { expect, test } from 'bun:test'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const sourcePath = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url))
const readSource = (relativePath: string) => {
  const path = sourcePath(relativePath)
  return existsSync(path) ? readFileSync(path, 'utf8') : ''
}

const pageHeaderSource = readSource('../src/components/page-header.tsx')
const planListSource = readSource('../src/views/plan-list-view.tsx')
const settingsSource = readSource('../src/views/settings-view.tsx')
const cssSource = readSource('../src/index.css')

test('plan list and settings use the shared page header module', () => {
  expect(pageHeaderSource).toContain('export const PageHeader')
  expect(planListSource).toContain('<PageHeader')
  expect(settingsSource).toContain('<PageHeader')
})

test('settings places its back action inside the shared header layout', () => {
  expect(pageHeaderSource).toContain('leading?: React.ReactNode')
  expect(settingsSource).toContain('<PageHeader')
  expect(settingsSource).toContain('leading={(')
})
 
test('plans and settings share the same mobile content inset', () => {
  expect(planListSource).toContain('className="plan-list-page"')
  expect(cssSource).toContain('  .plan-list-page {')
  expect(cssSource).toContain('    padding-top: calc(0.9rem + env(safe-area-inset-top, 0px)) !important;')
  expect(cssSource).toContain('    padding-left: 1.25rem !important;')
})
