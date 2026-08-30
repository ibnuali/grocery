const planPath = (planId: string, suffix = '') => `/plans/${encodeURIComponent(planId)}${suffix}`

export const planDetailPath = (planId: string) => planPath(planId)
export const planShopPath = (planId: string) => planPath(planId, '/shop')
export const planReconciliationPath = (planId: string) => planPath(planId, '/reconcile')
