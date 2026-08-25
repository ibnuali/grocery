import * as React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold"
            style={{ color: 'var(--color-ink-2)', fontFamily: 'var(--font-body)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={className}
          style={{
            width: '100%',
            borderRadius: 'var(--radius-input)',
            border: `1.5px solid ${error ? 'var(--color-accent-3)' : 'var(--color-rule)'}`,
            background: 'var(--color-paper)',
            padding: '0.6rem 0.85rem',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-ink)',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            transition: 'border-color 180ms var(--ease-out), box-shadow 180ms var(--ease-out)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-accent-3)' : 'var(--color-accent-deep)'
            e.currentTarget.style.boxShadow = `0 0 0 3px oklch(76% 0.20 95 / 0.25)`
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-accent-3)' : 'var(--color-rule)'
            e.currentTarget.style.boxShadow = 'none'
            props.onBlur?.(e)
          }}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium" style={{ color: 'var(--color-accent-3)' }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
