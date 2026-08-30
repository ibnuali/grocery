import React from 'react'
import { cn } from '../lib/utils'

type PageHeaderProps = {
  title: string
  subtitle: string
  eyebrow?: string
  leading?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, eyebrow, leading, action, className }) => (
  <header className={cn('page-header', className)}>
    {leading ? <div className="page-header__leading">{leading}</div> : null}
    <div className="page-header__copy">
      {eyebrow ? <p className="page-header__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p className="page-header__subtitle">{subtitle}</p>
    </div>
    {action ? <div className="page-header__actions">{action}</div> : null}
  </header>
)
