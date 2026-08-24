import i18n from './index'

export function formatCurrency(amount: number): string {
  const locale = i18n.language === 'en' ? 'en-US' : 'id-ID'
  return `Rp${amount.toLocaleString(locale)}`
}

export function formatNumber(n: number): string {
  const locale = i18n.language === 'en' ? 'en-US' : 'id-ID'
  return n.toLocaleString(locale)
}
