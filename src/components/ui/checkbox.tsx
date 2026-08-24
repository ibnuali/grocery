import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
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
      className={className}
      style={{
        display: 'flex',
        height: '1.5rem',
        width: '1.5rem',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: `1.5px solid ${checked ? 'var(--color-mint)' : 'var(--color-rule)'}`,
        background: checked ? 'var(--color-mint)' : 'var(--color-paper)',
        transition: 'all 180ms var(--ease-out)',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <BaseCheckbox.Indicator style={{ color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check className="h-4 w-4" style={{ strokeWidth: 3 }} />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}
