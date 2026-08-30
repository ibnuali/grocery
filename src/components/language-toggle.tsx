import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const labels: Record<string, string> = {
  id: 'ID',
  en: 'EN',
}

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation()

  const cycle = () => {
    const next = i18n.language === 'id' ? 'en' : 'id'
    i18n.changeLanguage(next)
  }

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={cycle}
      title={`Language: ${labels[i18n.language] || 'ID'} (click to switch)`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        minHeight: '2.75rem',
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
      <Globe style={{ height: '0.875rem', width: '0.875rem' }} />
      <span>{labels[i18n.language] || 'ID'}</span>
    </button>
  )
}
