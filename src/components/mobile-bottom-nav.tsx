import React from 'react'
import { ClipboardList, ListTodo, Receipt, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type NavigationView = 'list' | 'detail' | 'instore' | 'reconciliation'

interface MobileBottomNavProps {
  activeView: NavigationView
  planId?: string
  onNavigate: (view: NavigationView) => void
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeView, planId, onNavigate }) => {
  const { t } = useTranslation()
  const items = [
    { view: 'list' as const, label: t('navigation.plans'), icon: ListTodo, enabled: true },
    { view: 'detail' as const, label: t('navigation.detail'), icon: ClipboardList, enabled: Boolean(planId) },
    { view: 'instore' as const, label: t('navigation.shop'), icon: ShoppingCart, enabled: Boolean(planId) },
    { view: 'reconciliation' as const, label: t('navigation.receipt'), icon: Receipt, enabled: Boolean(planId) },
  ]

  return (
    <nav className="mobile-bottom-nav" aria-label={t('navigation.label')}>
      <div className="mobile-bottom-nav__inner">
        {items.map(({ view, label, icon: Icon, enabled }) => {
          const isActive = activeView === view
          return (
            <button
              key={view}
              type="button"
              disabled={!enabled}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(view)}
              className={`mobile-bottom-nav__item${isActive ? ' mobile-bottom-nav__item--active' : ''}`}
            >
              <Icon aria-hidden="true" size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
