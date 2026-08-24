import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui-components/react/dialog'

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
        <BaseDialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-all z-50" />
        <BaseDialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92vw] max-w-md rounded-2xl bg-white p-6 shadow-2xl focus:outline-none max-h-[90vh] overflow-y-auto">
          <BaseDialog.Title className="text-lg font-bold text-slate-900">
            {title}
          </BaseDialog.Title>
          {description && (
            <BaseDialog.Description className="mt-1 text-xs text-slate-500">
              {description}
            </BaseDialog.Description>
          )}
          <div className="mt-4">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
