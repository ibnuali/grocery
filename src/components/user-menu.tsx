import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Mail, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { User } from '../domain/auth.schema'
import { LanguageToggle } from './language-toggle'
import { ThemeToggle } from './theme-toggle'

interface UserMenuProps {
  user: User
  onLogout: () => void
}

const getInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return initials.toUpperCase() || '?'
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('common.accountMenu')}
        onClick={() => setIsOpen((open) => !open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          border: '1.5px solid var(--color-rule)',
          borderRadius: 'var(--radius-pill)',
          padding: '0.25rem 0.45rem 0.25rem 0.3rem',
          color: 'var(--color-ink)',
          background: 'var(--color-paper-2)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          transition: 'background 180ms var(--ease-out), border-color 180ms var(--ease-out)',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.background = 'var(--color-paper-3)'
          event.currentTarget.style.borderColor = 'var(--color-ink-3)'
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.background = 'var(--color-paper-2)'
          event.currentTarget.style.borderColor = 'var(--color-rule)'
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.75rem',
            height: '1.75rem',
            borderRadius: '50%',
            color: 'var(--color-ink)',
            background: 'var(--color-accent)',
            fontSize: 'var(--text-xs)',
            fontWeight: 800,
          }}
        >
          {getInitials(user.name)}
        </span>
        <span className="hidden sm:inline" style={{ maxWidth: '8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
          {user.name}
        </span>
        <ChevronDown aria-hidden="true" style={{ width: '0.9rem', height: '0.9rem', color: 'var(--color-ink-3)', transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 180ms var(--ease-out)' }} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={t('common.accountMenu')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.65rem)',
            right: 0,
            zIndex: 'var(--z-dropdown)',
            width: 'min(18rem, calc(100vw - 2rem))',
            padding: '0.5rem',
            border: '1.5px solid var(--color-rule)',
            borderRadius: 'var(--radius-card)',
            background: 'var(--color-paper)',
            boxShadow: 'var(--shadow-dropdown)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: '2.75rem', height: '2.75rem', borderRadius: '50%', color: 'var(--color-ink)', background: 'var(--color-accent)', fontSize: 'var(--text-sm)', fontWeight: 800 }}>
              {getInitials(user.name)}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', fontWeight: 700 }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', color: 'var(--color-ink-3)', fontSize: 'var(--text-xs)' }}>
                <Mail aria-hidden="true" style={{ width: '0.75rem', height: '0.75rem', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
              </div>
            </div>
          </div>

          <div aria-hidden="true" style={{ height: '1px', margin: '0.25rem 0.5rem', background: 'var(--color-rule)' }} />

          <div role="group" aria-label={t('common.settings')} style={{ padding: '0.5rem 0.75rem 0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem', color: 'var(--color-ink-2)', fontSize: 'var(--text-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              <Settings aria-hidden="true" style={{ width: '0.8rem', height: '0.8rem' }} />
              {t('common.settings')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          <div aria-hidden="true" style={{ height: '1px', margin: '0.25rem 0.5rem', background: 'var(--color-rule)' }} />

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', border: 0, borderRadius: 'var(--radius-input)', padding: '0.65rem 0.75rem', color: 'var(--color-accent-3)', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 700, textAlign: 'left' }}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'color-mix(in oklch, var(--color-accent-3) 10%, transparent)' }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent' }}
          >
            <LogOut aria-hidden="true" style={{ width: '1rem', height: '1rem' }} />
            {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
