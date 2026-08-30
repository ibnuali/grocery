const planPath = (planId: string, suffix = '') => `/plans/${encodeURIComponent(planId)}${suffix}`

export const planDetailPath = (planId: string) => planPath(planId)
export const planShopPath = (planId: string) => planPath(planId, '/shop')
export const planReconciliationPath = (planId: string) => planPath(planId, '/reconcile')

export type PublicAuthMode = 'login' | 'register'

export const publicAuthMode = (pathname: string): PublicAuthMode | null => {
  if (pathname === '/login') return 'login'
  if (pathname === '/register') return 'register'
  return null
}
