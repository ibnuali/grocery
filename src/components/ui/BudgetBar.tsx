import React from 'react'
import { Progress } from './Progress'
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

export interface BudgetBarProps {
  totalEstimated: number
  budgetTarget: number
  className?: string
}

export const BudgetBar: React.FC<BudgetBarProps> = ({
  totalEstimated,
  budgetTarget,
  className = ''
}) => {
  if (budgetTarget <= 0) {
    return null
  }

  const percentage = Math.round((totalEstimated / budgetTarget) * 100)
  const isOver = totalEstimated > budgetTarget
  const isClose = percentage >= 85 && !isOver

  const variant = isOver ? 'rose' : isClose ? 'amber' : 'emerald'

  return (
    <div className={`rounded-2xl bg-white p-4 border border-slate-100 shadow-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <TrendingUp className="h-4 w-4 text-slate-400" />
          <span>Penggunaan Anggaran ({percentage}%)</span>
        </div>
        <div className="font-semibold">
          {isOver ? (
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Over Budget Rp{(totalEstimated - budgetTarget).toLocaleString('id-ID')}
            </span>
          ) : isClose ? (
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <AlertTriangle className="h-3.5 w-3.5" />
              Mendekati Budget (Sisa Rp{(budgetTarget - totalEstimated).toLocaleString('id-ID')})
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aman (Sisa Rp{(budgetTarget - totalEstimated).toLocaleString('id-ID')})
            </span>
          )}
        </div>
      </div>

      <Progress value={percentage} colorVariant={variant} className="h-3" />

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div>
          Estimasi: <span className="font-bold text-slate-700">Rp{totalEstimated.toLocaleString('id-ID')}</span>
        </div>
        <div>
          Target: <span className="font-bold text-slate-700">Rp{budgetTarget.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  )
}
