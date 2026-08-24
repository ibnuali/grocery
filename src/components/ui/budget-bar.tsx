import React from 'react'
import { Progress } from './progress'
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

export interface BudgetBarProps {
  totalEstimated: number
  budgetTarget: number
  className?: string
}

export const BudgetBar: React.FC<BudgetBarProps> = ({
  totalEstimated,
  budgetTarget,
  className = '',
}) => {
  if (budgetTarget <= 0) return null

  const percentage = Math.round((totalEstimated / budgetTarget) * 100)
  const isOver = totalEstimated > budgetTarget
  const isClose = percentage >= 85 && !isOver

  const variant = isOver ? 'coral' : isClose ? 'accent' : 'mint'

  return (
    <div
      className={className}
      style={{
        borderRadius: 'var(--radius-card)',
        background: 'var(--color-paper-2)',
        padding: '1rem',
        border: '1.5px solid var(--color-rule)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, color: 'var(--color-ink)' }}>
          <TrendingUp style={{ height: '1rem', width: '1rem', color: 'var(--color-ink-3)' }} />
          <span style={{ fontFamily: 'var(--font-body)' }}>Penggunaan Anggaran ({percentage}%)</span>
        </div>
        <div style={{ fontWeight: 600, fontFamily: 'var(--font-body)' }}>
          {isOver ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-accent-3)', fontWeight: 700 }}>
              <AlertTriangle style={{ height: '0.875rem', width: '0.875rem' }} />
              Over Budget Rp{(totalEstimated - budgetTarget).toLocaleString('id-ID')}
            </span>
          ) : isClose ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-accent)', fontWeight: 700 }}>
              <AlertTriangle style={{ height: '0.875rem', width: '0.875rem' }} />
              Mendekati Budget
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-mint)', fontWeight: 700 }}>
              <CheckCircle2 style={{ height: '0.875rem', width: '0.875rem' }} />
              Aman (Sisa Rp{(budgetTarget - totalEstimated).toLocaleString('id-ID')})
            </span>
          )}
        </div>
      </div>

      <Progress value={percentage} colorVariant={variant} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
        <div>
          Estimasi: <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>Rp{totalEstimated.toLocaleString('id-ID')}</span>
        </div>
        <div>
          Target: <span style={{ fontWeight: 700, color: 'var(--color-ink)' }}>Rp{budgetTarget.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  )
}
