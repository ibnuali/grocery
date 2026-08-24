import * as React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'soft' | 'outline' | 'danger' | 'ghost' | 'coral' | 'cyan'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const base = 'btn'
    const variantClass = {
      primary: '',
      soft: 'btn--soft',
      outline: 'btn--outline',
      danger: 'btn--coral',
      ghost: 'btn--outline',
      coral: 'btn--coral',
      cyan: 'btn--cyan',
    }[variant]
    const sizeClass = {
      sm: 'btn--sm',
      md: '',
      lg: 'btn--lg',
    }[size]

    return (
      <button
        ref={ref}
        className={cn(base, variantClass, sizeClass, className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
