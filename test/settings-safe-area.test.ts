import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(fileURLToPath(new URL('../src/index.css', import.meta.url)), 'utf8')
const mobileSettingsPageBlock = css.match(/@media \(max-width: 39\.999rem\) \{\s+\.settings-page \{([\s\S]*?)\n  \}\n\n  \.settings-page__back/s)?.[1] ?? ''

test('mobile settings keeps the back action visible in the shared header', () => {
  expect(mobileSettingsPageBlock).toContain('padding: calc(0.9rem + env(safe-area-inset-top, 0px)) 1.25rem max(1.5rem, env(safe-area-inset-bottom, 0px));')
  expect(css).toContain('  .settings-page__back {')
  expect(css).toContain('    display: inline-flex;')
  expect(css).toContain('    width: 2.25rem;')
  expect(css).toContain('    height: 2.25rem;')
  expect(css).toContain('  .settings-page__header {')
  expect(css).toContain('  font: 700 var(--text-2xl) var(--font-display);')
  expect(css).toContain('  line-height: 1.2;')
  expect(css).toContain('  .page-header__subtitle {')
  expect(css).toContain('    display: block;')
})
