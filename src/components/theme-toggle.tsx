import React from 'react'
import { useTheme } from '../hooks/use-theme'
import { Sun, Moon, Monitor } from 'lucide-react'

const labels: Record<string, string> = {
  light: 'Terang',
  dark: 'Gelap',
  system: 'Otomatis',
}

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const next = order[(order.indexOf(theme) + 1) % order.length]
    setTheme(next)
  }

  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Tema: ${labels[theme]} (klik untuk ganti)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        borderRadius: 'var(--radius-pill)',
        padding: '0.375rem 0.625rem',
        fontSize: 'var(--text-xs)',
        fontWeight: 500,
        color: 'var(--color-ink-2)',
        background: 'var(--color-paper-2)',
        border: '1.5px solid var(--color-rule)',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        transition: 'background 180ms var(--ease-out), border-color 180ms var(--ease-out)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-paper-3)'
        e.currentTarget.style.borderColor = 'var(--color-ink-3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--color-paper-2)'
        e.currentTarget.style.borderColor = 'var(--color-rule)'
      }}
    >
      <Icon style={{ height: '0.875rem', width: '0.875rem' }} />
      <span className="hidden sm:inline">{labels[theme]}</span>
    </button>
  )
}
