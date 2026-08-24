import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ open, onOpenChange, title, description, children }) => {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          style={{
            position: 'fixed',
            inset: 0,
            background: 'oklch(20% 0.012 250 / 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-modal)',
          }}
        />
        <BaseDialog.Popup
          style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 'calc(var(--z-modal) + 1)',
            width: '92vw',
            maxWidth: '28rem',
            borderRadius: 'var(--radius-card)',
            background: 'var(--color-paper)',
            padding: '1.5rem',
            boxShadow: '0 24px 64px -16px oklch(20% 0.012 250 / 0.2)',
            outline: 'none',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <BaseDialog.Title
            style={{
              fontSize: 'var(--text-md)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {title}
          </BaseDialog.Title>
          {description && (
            <BaseDialog.Description
              style={{
                marginTop: '0.25rem',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-ink-3)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {description}
            </BaseDialog.Description>
          )}
          <div style={{ marginTop: '1rem' }}>{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
