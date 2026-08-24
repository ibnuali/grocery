import React, { useState } from 'react'
import { Modal } from '../components/ui/modal'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { BudgetBar } from '../components/ui/budget-bar'
import { ItemAutocomplete } from '../components/ui/item-autocomplete'
import { Plus, Trash2, Calendar, ShoppingBag, ArrowRight } from 'lucide-react'
import type { MasterItem } from '../domain/catalog.schema'
import type { PlanItem } from '../domain/plan.schema'

export interface PlanDetailViewProps {
  planTitle: string; shoppingDate: string; budgetTarget: number; items: readonly PlanItem[]
  onAddItem: (item: { itemName: string; qty: number; unit: string; estimatedPrice: number; category: string }) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>; onStartShopping: () => void; onReconcile: () => void; onBack: () => void
}

export const PlanDetailView: React.FC<PlanDetailViewProps> = ({ planTitle, shoppingDate, budgetTarget, items, onAddItem, onDeleteItem, onStartShopping, onReconcile, onBack }) => {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('General')
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState('pcs')
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleAutocompleteChange = (name: string, master?: MasterItem) => {
    setItemName(name)
    if (master) { setEstimatedPrice(Number(master.latest_price)); if (master.category) setCategory(master.category) }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!itemName.trim()) return; setSubmitting(true)
    await onAddItem({ itemName: itemName.trim(), category: category.trim() || 'General', qty: Number(qty) || 1, unit: unit.trim() || 'pcs', estimatedPrice: Number(estimatedPrice) || 0 })
    setSubmitting(false); setIsAddOpen(false); setItemName(''); setQty(1); setUnit('pcs'); setEstimatedPrice(0)
  }

  const totalEstimated = items.reduce((acc, item) => acc + Number(item.qty) * Number(item.estimated_price), 0)

  const itemRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px',
    background: 'var(--color-paper)', padding: '1rem', border: '1.5px solid var(--color-rule)',
    transition: 'border-color 180ms var(--ease-out)',
  }

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'color 180ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-3)' }}>
          ← Kembali ke Daftar
        </button>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>
          <Calendar style={{ height: '0.875rem', width: '0.875rem' }} />{shoppingDate}
        </span>
      </div>

      <div style={{ borderRadius: 'var(--radius-card)', background: 'var(--color-paper)', padding: '1.5rem', border: '1.5px solid var(--color-rule)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px -4px oklch(20% 0.012 250 / 0.06)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>{planTitle}</h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', marginTop: '0.25rem', fontFamily: 'var(--font-body)' }}>Target Anggaran: <span style={{ fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>Rp{budgetTarget.toLocaleString('id-ID')}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={onReconcile}>Rekonsiliasi Struk</Button>
            <Button size="sm" onClick={onStartShopping}><span>Mulai Belanja</span><ArrowRight style={{ height: '0.875rem', width: '0.875rem' }} /></Button>
          </div>
        </div>
        <BudgetBar totalEstimated={totalEstimated} budgetTarget={budgetTarget} />
        <div style={{ borderRadius: '14px', background: 'oklch(86% 0.18 95 / 0.12)', padding: '1rem', border: '1.5px solid oklch(86% 0.18 95 / 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-deep)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>Estimasi Total Belanja</div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-accent-deep)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>Rp{totalEstimated.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>Jumlah Item</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>{items.length} item</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>Daftar Barang ({items.length})</h2>
          <Button size="sm" onClick={() => setIsAddOpen(true)}><Plus style={{ height: '1rem', width: '1rem' }} /><span>Tambah Item</span></Button>
        </div>
        {items.length === 0 ? (
          <div style={{ borderRadius: 'var(--radius-card)', border: '2px dashed var(--color-rule)', background: 'var(--color-paper)', padding: '2rem', textAlign: 'center' }}>
            <ShoppingBag style={{ margin: '0 auto 0.5rem', height: '2rem', width: '2rem', color: 'var(--color-ink-3)' }} />
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>Belum ada barang di daftar</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', marginTop: '0.25rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>Tambahkan barang pertama untuk mulai menghitung estimasi belanja otomatis</p>
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} style={{ marginTop: '1rem' }}><Plus style={{ height: '1rem', width: '1rem' }} /><span>Tambah Barang Sekarang</span></Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {items.map((item) => {
              const subtotal = Number(item.qty) * Number(item.estimated_price)
              return (
                <div key={item.id} style={itemRow} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-2)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{item.item_name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{Number(item.qty)} {item.unit} × Rp{Number(item.estimated_price).toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>Rp{subtotal.toLocaleString('id-ID')}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>subtotal</div>
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

      <Modal open={isAddOpen} onOpenChange={setIsAddOpen} title="Tambah Barang Belanja" description="Pilih dari katalog atau ketik nama barang baru">
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-2)', fontFamily: 'var(--font-body)' }}>Nama Barang</label>
            <ItemAutocomplete value={itemName} onChange={handleAutocompleteChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input label="Jumlah (Qty)" type="number" min="0.1" step="any" value={qty} onChange={(e) => setQty(parseFloat(e.target.value) || 1)} required />
            <Input label="Satuan (Unit)" placeholder="pcs, kg, btl" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          </div>
          <Input label="Estimasi Harga Satuan (Rp)" type="number" min="0" step="any" value={estimatedPrice} onChange={(e) => setEstimatedPrice(parseFloat(e.target.value) || 0)} required />
          <div style={{ borderRadius: 'var(--radius-input)', background: 'var(--color-paper-2)', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-body)' }}>
            <span style={{ color: 'var(--color-ink-3)', fontWeight: 500 }}>Subtotal Estimasi:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-ink)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>Rp{(qty * estimatedPrice).toLocaleString('id-ID')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button type="submit" size="sm" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Tambahkan ke Daftar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
