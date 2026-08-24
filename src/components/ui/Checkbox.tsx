import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox'
import { Check } from 'lucide-react'

export interface CheckboxProps {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheckedChange, disabled, className = '' }) => {
  return (
    <BaseCheckbox.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 data-[checked]:border-emerald-600 data-[checked]:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <BaseCheckbox.Indicator className="text-white flex items-center justify-center">
        <Check className="h-4 w-4 stroke-[3]" />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}
