import React from 'react'
import { List, Plus, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { isMobileNavigationActive } from '../lib/mobile-navigation'

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const plansActive = isMobileNavigationActive('plans', location.pathname)
  const profileActive = isMobileNavigationActive('profile', location.pathname)

  return (
    <nav className="mobile-bottom-nav" aria-label={t('navigation.label')}>
      <button
        type="button"
        className={`mobile-bottom-nav__item${plansActive ? ' mobile-bottom-nav__item--active' : ''}`}
        onClick={() => navigate('/plans')}
        aria-label={t('navigation.plans')}
        aria-current={plansActive ? 'page' : undefined}
      >
        <List aria-hidden="true" />
      </button>
      <button
        type="button"
        className="mobile-bottom-nav__create"
        onClick={() => navigate('/plans?create=1')}
        aria-label={t('planList.createPlan')}
      >
        <Plus aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`mobile-bottom-nav__item${profileActive ? ' mobile-bottom-nav__item--active' : ''}`}
        onClick={() => navigate('/settings', { state: { from: location.pathname } })}
        aria-label={t('common.profile')}
        aria-current={profileActive ? 'page' : undefined}
      >
        <UserRound aria-hidden="true" />
      </button>
    </nav>
  )
}
