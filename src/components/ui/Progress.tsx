import * as React from 'react'

export interface ProgressProps {
  value: number // 0 - 100
  className?: string
  colorVariant?: 'emerald' | 'amber' | 'rose'
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '', colorVariant = 'emerald' }) => {
  const boundedValue = Math.min(100, Math.max(0, value))
  const colors = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  }

  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
      <div
        className={`h-full transition-all duration-300 ${colors[colorVariant]}`}
        style={{ width: `${boundedValue}%` }}
      />
    </div>
  )
}
