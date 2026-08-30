import React, { useState, useEffect, useRef } from 'react'
import { Effect } from 'effect'
import { CatalogService } from '../../services/catalog-service'
import type { MasterItem } from '../../domain/catalog.schema'
import { Search, Plus, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../../i18n/format'

export interface ItemAutocompleteProps {
  value: string
  onChange: (name: string, item?: MasterItem) => void
  placeholder?: string
  className?: string
}

export const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
}) => {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('itemAutocomplete.placeholder')
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<readonly MasterItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen || query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const timeout = setTimeout(async () => {
const prog = CatalogService.searchItems(query.trim()).pipe(
        Effect.map((items) => { setResults(items); setLoading(false) }),
        Effect.catchAll(() => { setResults([]); setLoading(false); return Effect.succeed(undefined) })
      )
      await Effect.runPromise(prog)
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, isOpen])

  const handleSelect = (item: MasterItem) => {
    setQuery(item.name)
    onChange(item.name, item)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setIsOpen(true)
  }

  const exactMatch = results.find((r) => r.name.toLowerCase() === query.trim().toLowerCase())

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Search
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            height: '1rem',
            width: '1rem',
            color: 'var(--color-ink-3)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={(e) => { setIsOpen(true); e.currentTarget.style.borderColor = 'var(--color-accent-deep)'; e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in oklch, var(--color-accent-deep) 25%, transparent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--color-rule)'; e.currentTarget.style.boxShadow = 'none' }}
          placeholder={resolvedPlaceholder}
          style={{
            width: '100%',
            borderRadius: 'var(--radius-input)',
            border: '1.5px solid var(--color-rule)',
            background: 'var(--color-paper)',
            padding: '0.6rem 0.85rem 0.6rem 2.25rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            transition: 'border-color 180ms var(--ease-out), box-shadow 180ms var(--ease-out)',
          }}
        />
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            borderRadius: 'var(--radius-card)',
            background: 'var(--color-paper)',
            border: '1.5px solid var(--color-rule)',
            boxShadow: '0 12px 32px -16px oklch(20% 0.012 250 / 0.15)',
            zIndex: 'var(--z-dropdown)',
            maxHeight: '14rem',
            overflowY: 'auto',
          }}
        >
          {loading ? (
            <div style={{ padding: '0.75rem 1rem', fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>
              {t('itemAutocomplete.searching')}
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>
              <Plus style={{ height: '0.875rem', width: '0.875rem' }} />
              <span>{t('itemAutocomplete.newItem')} <strong style={{ color: 'var(--color-ink)' }}>{query}</strong></span>
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.6rem 1rem',
                  fontSize: 'var(--text-xs)',
                  textAlign: 'left',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-ink)',
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-paper-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  {item.category && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem', color: 'var(--color-ink-3)' }}>
                      <Tag style={{ height: '0.625rem', width: '0.625rem' }} />
                      <span>{item.category}</span>
                    </div>
                  )}
                </div>
                {item.latest_price && (
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', color: 'var(--color-ink-2)' }}>
                    {formatCurrency(Number(item.latest_price))}
                  </span>
                )}
              </button>
            ))
          )}

          {!exactMatch && query.trim().length > 0 && (
            <button
              type="button"
              onClick={() => { onChange(query.trim()); setIsOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                width: '100%',
                padding: '0.6rem 1rem',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: 'var(--color-accent-2)',
                border: 'none',
                borderTop: '1px solid var(--color-rule)',
                background: 'var(--color-paper-2)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                borderRadius: '0 0 var(--radius-card) var(--radius-card)',
              }}
            >
              <Plus style={{ height: '0.875rem', width: '0.875rem' }} />
              {t('itemAutocomplete.useAsNew', { query: query.trim() })}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
