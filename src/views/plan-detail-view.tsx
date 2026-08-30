import React, { useState } from 'react'
import { Modal } from '../components/ui/modal'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { BudgetBar } from '../components/ui/budget-bar'
import { ItemAutocomplete } from '../components/ui/item-autocomplete'
import { Plus, Pencil, Trash2, Calendar, ShoppingBag, ArrowRight } from 'lucide-react'
import type { MasterItem } from '../domain/catalog.schema'
import type { PlanItem } from '../domain/plan.schema'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../i18n/format'

export const PlanDetailSkeleton: React.FC = () => (
  <div className="plan-detail-skeleton" role="status" aria-live="polite" aria-label="Loading plan details">
    <span className="sr-only">Loading plan details</span>
    <div className="plan-detail-skeleton__topline">
      <span className="skeleton-block skeleton-block--back" />
      <span className="skeleton-block skeleton-block--date" />
    </div>
    <section className="plan-detail-skeleton__card">
      <div className="plan-detail-skeleton__heading">
        <span className="skeleton-block skeleton-block--title" />
        <span className="skeleton-block skeleton-block--subtitle" />
      </div>
      <div className="plan-detail-skeleton__actions">
        <span className="skeleton-block skeleton-block--button" />
        <span className="skeleton-block skeleton-block--button skeleton-block--button-wide" />
      </div>
      <span className="skeleton-block skeleton-block--bar" />
      <div className="plan-detail-skeleton__summary">
        <span className="skeleton-block skeleton-block--summary" />
        <span className="skeleton-block skeleton-block--summary" />
      </div>
    </section>
    <div className="plan-detail-skeleton__items-heading">
      <span className="skeleton-block skeleton-block--section-title" />
      <span className="skeleton-block skeleton-block--button" />
    </div>
    <div className="plan-detail-skeleton__items">
      <span className="skeleton-block skeleton-block--item" />
      <span className="skeleton-block skeleton-block--item" />
      <span className="skeleton-block skeleton-block--item" />
    </div>
  </div>
)

export interface PlanDetailsUpdate {
  title: string
  budgetTarget: number
  shoppingDate: string
}

export interface PlanDetailViewProps {
  planTitle: string; shoppingDate: string; budgetTarget: number; items: readonly PlanItem[]
  canReconcile: boolean
  onUpdatePlan: (details: PlanDetailsUpdate) => Promise<boolean>
  onAddItem: (item: { itemName: string; qty: number; unit: string; estimatedPrice: number; category: string }) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>; onStartShopping: () => void; onReconcile: () => void; onBack: () => void
}

export const PlanDetailView: React.FC<PlanDetailViewProps> = ({
  planTitle,
  shoppingDate,
  budgetTarget,
  items,
  canReconcile,
  onUpdatePlan,
  onAddItem,
  onDeleteItem,
  onStartShopping,
  onReconcile,
  onBack
}) => {
  const { t } = useTranslation()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(planTitle)
  const [editBudgetTarget, setEditBudgetTarget] = useState(String(budgetTarget))
  const [editShoppingDate, setEditShoppingDate] = useState(shoppingDate)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('General')
  const [qty, setQty] = useState('1')
  const [unit, setUnit] = useState('pcs')
  const [estimatedPrice, setEstimatedPrice] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [updatingPlan, setUpdatingPlan] = useState(false)

  const handleAutocompleteChange = (name: string, master?: MasterItem) => {
    setItemName(name)
    if (master) { setEstimatedPrice(String(master.latest_price)); if (master.category) setCategory(master.category) }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!itemName.trim()) return; setSubmitting(true)
    await onAddItem({ itemName: itemName.trim(), category: category.trim() || 'General', qty: Number(qty) || 1, unit: unit.trim() || 'pcs', estimatedPrice: Number(estimatedPrice) || 0 })
    setSubmitting(false); setIsAddOpen(false); setItemName(''); setQty('1'); setUnit('pcs'); setEstimatedPrice('0')
  }

  const handleEditOpen = () => {
    setEditTitle(planTitle)
    setEditBudgetTarget(String(budgetTarget))
    setEditShoppingDate(shoppingDate)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim() || !editShoppingDate) return
    setUpdatingPlan(true)
    try {
      const saved = await onUpdatePlan({
        title: editTitle.trim(),
        budgetTarget: Number(editBudgetTarget) || 0,
        shoppingDate: editShoppingDate
      })
      if (saved) setIsEditOpen(false)
    } finally {
      setUpdatingPlan(false)
    }
  }

  const totalEstimated = items.reduce((acc, item) => acc + Number(item.qty) * Number(item.estimated_price), 0)

  const itemRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px',
    background: 'var(--color-paper)', padding: '1rem', border: '1.5px solid var(--color-rule)',
    transition: 'border-color 180ms var(--ease-out)',
  }

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button type="button" onClick={onBack} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'color 180ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-3)' }}>
          {t('planDetail.backToList')}
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>
          <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />{shoppingDate}
        </span>
      </div>

      <div style={{ borderRadius: 'var(--radius-card)', background: 'var(--color-paper)', padding: '1.5rem', border: '1.5px solid var(--color-rule)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px -4px oklch(20% 0.012 250 / 0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>{planTitle}</h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>{t('planDetail.budgetTarget')} <span style={{ fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(budgetTarget)}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={handleEditOpen}><Pencil style={{ height: '0.875rem', width: '0.875rem' }} /><span>{t('planDetail.editPlan')}</span></Button>
            <Button variant="outline" size="sm" onClick={onReconcile} disabled={!canReconcile} title={!canReconcile ? t('planDetail.reconcileUnavailable') : undefined}>{t('planDetail.reconcile')}</Button>
            <Button size="sm" onClick={onStartShopping}><span>{t('planDetail.startShopping')}</span><ArrowRight style={{ height: '0.875rem', width: '0.875rem' }} /></Button>
          </div>
        </div>
        <BudgetBar totalEstimated={totalEstimated} budgetTarget={budgetTarget} />
        <div style={{ borderRadius: '14px', background: 'color-mix(in oklch, var(--color-accent) 12%, transparent)', padding: '1rem', border: '1.5px solid color-mix(in oklch, var(--color-accent) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-deep)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>{t('planDetail.totalEstimate')}</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-accent-deep)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(totalEstimated)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>{t('planDetail.itemCount', { count: items.length })}</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{t('planDetail.itemCount', { count: items.length })}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{t('planDetail.itemList')} ({items.length})</h2>
          <Button size="sm" onClick={() => setIsAddOpen(true)}><Plus style={{ height: '1rem', width: '1rem' }} /><span>{t('common.addItem')}</span></Button>
        </div>
        {items.length === 0 ? (
          <div style={{ borderRadius: 'var(--radius-card)', border: '2px dashed var(--color-rule)', background: 'var(--color-paper)', padding: '2rem', textAlign: 'center' }}>
            <ShoppingBag style={{ margin: '0 auto 0.5rem', height: '2rem', width: '2rem', color: 'var(--color-ink-3)' }} />
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{t('planDetail.emptyTitle')}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', marginTop: '0.25rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{t('planDetail.emptyDesc')}</p>
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} style={{ marginTop: '1rem' }}><Plus style={{ height: '1rem', width: '1rem' }} /><span>{t('planDetail.addFirstItem')}</span></Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((item) => {
              const subtotal = Number(item.qty) * Number(item.estimated_price)
              return (
                <div key={item.id} style={itemRow} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-deep)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{item.item_name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{Number(item.qty)} {item.unit} × {formatCurrency(Number(item.estimated_price))}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(subtotal)}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>{t('common.subtotal')}</div>
                    </div>
                    <button type="button" onClick={() => onDeleteItem(item.id)} style={{ padding: '0.375rem', color: 'var(--color-ink-3)', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'color 180ms, background 180ms' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent-3)'; e.currentTarget.style.background = 'oklch(68% 0.24 18 / 0.08)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-3)'; e.currentTarget.style.background = 'transparent' }}>
                      <Trash2 style={{ height: '1rem', width: '1rem' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={isAddOpen} onOpenChange={setIsAddOpen} title={t('planDetail.modalTitle')} description={t('planDetail.modalDesc')}>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-2)', fontFamily: 'var(--font-body)' }}>{t('common.itemName')}</label>
            <ItemAutocomplete value={itemName} onChange={handleAutocompleteChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input label={t('planDetail.qtyLabel')} type="number" min="0.1" step="any" value={qty} onChange={(e) => setQty(e.target.value)} required />
            <Input label={t('planDetail.unitLabel')} placeholder={t('planDetail.unitPlaceholder')} value={unit} onChange={(e) => setUnit(e.target.value)} required />
          </div>
          <Input label={t('planDetail.priceLabel')} type="number" min="0" step="any" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} required />
          <div style={{ borderRadius: 'var(--radius-input)', background: 'var(--color-paper-2)', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)' }}>
            <span style={{ color: 'var(--color-ink-3)', fontWeight: 500 }}>{t('planDetail.subtotalEstimate')}</span>
            <span style={{ fontWeight: 700, color: 'var(--color-ink)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(Number(qty) * Number(estimatedPrice))}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" size="sm" disabled={submitting}>{submitting ? t('common.saving') : t('planDetail.addButton')}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={isEditOpen} onOpenChange={setIsEditOpen} title={t('planDetail.editModalTitle')} description={t('planDetail.editModalDesc')}>
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t('planList.nameLabel')} placeholder={t('planList.namePlaceholder')} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          <Input label={t('planList.budgetLabel')} type="number" min="0" step="10000" value={editBudgetTarget} onChange={(e) => setEditBudgetTarget(e.target.value)} required />
          <Input label={t('planList.dateLabel')} type="date" value={editShoppingDate} onChange={(e) => setEditShoppingDate(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>{t('common.cancel')}</Button>
            <Button type="submit" size="sm" disabled={updatingPlan}>{updatingPlan ? t('common.saving') : t('planDetail.savePlan')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
