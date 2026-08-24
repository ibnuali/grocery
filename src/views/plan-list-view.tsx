import React, { useState, useEffect } from 'react'
import { Effect } from 'effect'
import { useTranslation } from 'react-i18next'
import { PlanService } from '../services/plan-service'
import { useToast } from '../hooks/use-toast'
import { Modal } from '../components/ui/modal'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import type { ShoppingPlan } from '../domain/plan.schema'
import { Plus, Calendar, ChevronRight, ShoppingBag, LogOut } from 'lucide-react'
import { formatCurrency } from '../i18n/format'

export interface PlanListViewProps {
  onSelectPlan: (planId: string) => void
  onLogout: () => void
}

export const PlanListView: React.FC<PlanListViewProps> = ({ onSelectPlan, onLogout }) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [plans, setPlans] = useState<readonly ShoppingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [budgetTarget, setBudgetTarget] = useState('1500000')
  const [shoppingDate, setShoppingDate] = useState(new Date().toISOString().split('T')[0])
  const [creating, setCreating] = useState(false)

  const loadPlans = async () => {
    setLoading(true)
    const prog = PlanService.listPlans().pipe(
      Effect.map((data) => { setPlans(data); setLoading(false) }),
      Effect.catchAll(() => { toast(t('planList.errorLoad'), 'error'); setLoading(false); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  useEffect(() => { loadPlans() }, [])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)
    const prog = PlanService.createPlan(title.trim(), Number(budgetTarget) || 0, shoppingDate).pipe(
      Effect.map((newPlan) => { setIsCreateOpen(false); setTitle(''); setCreating(false); onSelectPlan(newPlan.id) }),
      Effect.catchAll(() => { setCreating(false); toast(t('planList.errorCreate'), 'error'); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog)
  }

  const cardBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    borderRadius: 'var(--radius-card)', background: 'var(--color-paper)', padding: '1.25rem',
    border: '1.5px solid var(--color-rule)', cursor: 'pointer',
    transition: 'transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out), border-color 220ms var(--ease-out)',
    boxShadow: '0 2px 8px -4px oklch(20% 0.012 250 / 0.06)',
  }

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: '12rem' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>{t('planList.title')}</h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)', marginTop: '0.25rem' }}>{t('planList.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}><Plus style={{ height: '1rem', width: '1rem' }} /><span>{t('planList.createPlan')}</span></Button>
          <Button variant="outline" size="sm" onClick={onLogout}><LogOut style={{ height: '1rem', width: '1rem', color: 'var(--color-ink-3)' }} /></Button>
        </div>
      </div>

      {loading ? (
        <div style={{ borderRadius: 'var(--radius-card)', background: 'var(--color-paper-2)', padding: '3rem', textAlign: 'center', border: '1.5px solid var(--color-rule)', color: 'var(--color-ink-3)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>{t('planList.loading')}</div>
      ) : plans.length === 0 ? (
        <div style={{ borderRadius: 'var(--radius-card)', border: '2px dashed var(--color-rule)', background: 'var(--color-paper)', padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', height: '3rem', width: '3rem', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: 'oklch(86% 0.18 95 / 0.2)', color: 'var(--color-accent-deep)' }}>
            <ShoppingBag style={{ height: '1.5rem', width: '1.5rem' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{t('planList.emptyTitle')}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', maxWidth: '20rem', margin: '0.25rem auto 0', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{t('planList.emptyDesc')}</p>
          </div>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} style={{ marginTop: '0.5rem' }}><Plus style={{ height: '1rem', width: '1rem' }} /><span>{t('planList.createFirst')}</span></Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {plans.map((p) => {
            const isCompleted = p.status === 'COMPLETED'
            return (
              <div key={p.id} onClick={() => onSelectPlan(p.id)} style={cardBase}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px -8px oklch(20% 0.012 250 / 0.12)'; e.currentTarget.style.borderColor = 'var(--color-accent-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px -4px oklch(20% 0.012 250 / 0.06)'; e.currentTarget.style.borderColor = 'var(--color-rule)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{p.title}</span>
                    <span style={{ borderRadius: 'var(--radius-pill)', padding: '0.125rem 0.5rem', fontSize: '0.625rem', fontWeight: 700, fontFamily: 'var(--font-body)', background: isCompleted ? 'oklch(80% 0.16 150 / 0.2)' : 'oklch(86% 0.18 95 / 0.3)', color: isCompleted ? 'var(--color-mint)' : 'var(--color-accent-deep)' }}>{isCompleted ? t('planList.statusCompleted') : t('planList.statusPlanning')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar style={{ height: '0.875rem', width: '0.875rem' }} />{p.shopping_date ? p.shopping_date.substring(0, 10) : '-'}</span>
                    <span style={{ color: 'var(--color-rule)' }}>•</span>
                    <span>{t('planList.target')} <strong style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(Number(p.budget_target))}</strong></span>
                  </div>
                </div>
                <ChevronRight style={{ height: '1.25rem', width: '1.25rem', color: 'var(--color-ink-3)' }} />
              </div>
            )
          })}
        </div>
      )}

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen} title={t('planList.modalTitle')} description={t('planList.modalDesc')}>
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t('planList.nameLabel')} placeholder={t('planList.namePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label={t('planList.budgetLabel')} type="number" min="0" step="10000" value={budgetTarget} onChange={(e) => setBudgetTarget(e.target.value)} required />
          <Input label={t('planList.dateLabel')} type="date" value={shoppingDate} onChange={(e) => setShoppingDate(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" size="sm" disabled={creating}>{creating ? t('common.saving') : t('planList.createButton')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
