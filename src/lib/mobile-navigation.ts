export type MobileNavigationKey = 'plans' | 'profile'

export const isMobileNavigationActive = (key: MobileNavigationKey, pathname: string): boolean => {
  if (key === 'plans') return pathname === '/plans' || pathname.startsWith('/plans/')
  return pathname === '/settings' || pathname.startsWith('/settings/')
}

export const isCreatePlanRequest = (search: string): boolean => {
  return new URLSearchParams(search).get('create') === '1'
}
