import React, { useState } from 'react'
import { Effect } from 'effect'
import { Modal } from '../components/ui/modal'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { ItemAutocomplete } from '../components/ui/item-autocomplete'
import { ReconciliationService, type PlannedItemReconcile, type UnplannedItemReconcile } from '../services/reconciliation-service'
import type { PlanItem, ShoppingPlan } from '../domain/plan.schema'
import type { MasterItem } from '../domain/catalog.schema'
import { Receipt, Plus, ArrowLeft, TrendingUp, TrendingDown, MinusCircle, Check } from 'lucide-react'

interface UnplannedItemWithKey extends UnplannedItemReconcile { _key: string }
export interface ReconciliationViewProps { plan: ShoppingPlan; onSuccess: (updatedPlan: ShoppingPlan) => void; onBack: () => void }
interface PlannedFormState { [id: string]: { actual_price: string; is_skipped: boolean } }

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({ plan, onSuccess, onBack }) => {
  const [plannedState, setPlannedState] = useState<PlannedFormState>(() => {
    const initial: PlannedFormState = {}
    plan.items?.forEach((item: PlanItem) => { initial[item.id] = { actual_price: '', is_skipped: false } })
    return initial
  })
  const [unplannedItems, setUnplannedItems] = useState<UnplannedItemWithKey[]>([])
  const [isAddUnplannedOpen, setIsAddUnplannedOpen] = useState(false)
  const [unplannedName, setUnplannedName] = useState('')
  const [unplannedCategory, setUnplannedCategory] = useState('General')
  const [unplannedQty, setUnplannedQty] = useState('1')
  const [unplannedUnit, setUnplannedUnit] = useState('pcs')
  const [unplannedPrice, setUnplannedPrice] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePriceChange = (id: string, price: string) => { setPlannedState((prev) => ({ ...prev, [id]: { ...prev[id], actual_price: price } })) }
  const handleToggleSkip = (id: string) => { setPlannedState((prev) => ({ ...prev, [id]: { ...prev[id], is_skipped: !prev[id].is_skipped } })) }

  const handleAddUnplannedSubmit = (e: React.FormEvent) => {
    e.preventDefault(); if (!unplannedName.trim()) return
    setUnplannedItems((prev) => [...prev, { _key: crypto.randomUUID(), item_name: unplannedName.trim(), category: unplannedCategory.trim() || 'General', qty: Number(unplannedQty) || 1, unit: unplannedUnit.trim() || 'pcs', actual_price: Number(unplannedPrice) || 0 }])
    setIsAddUnplannedOpen(false); setUnplannedName(''); setUnplannedQty('1'); setUnplannedUnit('pcs'); setUnplannedPrice('0')
  }

  const totalEstimated = plan.items?.reduce((acc: number, item: PlanItem) => { if (plannedState[item.id]?.is_skipped) return acc; return acc + Number(item.qty) * Number(item.estimated_price) }, 0) ?? 0
  const plannedActualTotal = plan.items?.reduce((acc: number, item: PlanItem) => { const state = plannedState[item.id]; if (state?.is_skipped) return acc; return acc + Number(item.qty) * (Number(state?.actual_price) || 0) }, 0) ?? 0
  const unplannedActualTotal = unplannedItems.reduce((acc: number, item: UnplannedItemWithKey) => acc + Number(item.qty) * Number(item.actual_price), 0)
  const grandTotalActual = plannedActualTotal + unplannedActualTotal
  const variance = grandTotalActual - totalEstimated
  const handleSubmitReconciliation = async () => {
    setSubmitting(true); setError(null)
    const plannedPayload: PlannedItemReconcile[] = Object.entries(plannedState).map(([id, val]) => ({ id, actual_price: Number(val.actual_price) || 0, is_skipped: val.is_skipped }))
    const prog = ReconciliationService.reconcile(plan.id, plannedPayload, unplannedItems.map(({ _key, ...rest }) => rest)).pipe(
      Effect.map((updatedPlan) => onSuccess(updatedPlan)),
      Effect.catchAll((err) => { const message = err instanceof Error ? err.message : 'Gagal menyimpan rekonsiliasi'; setError(message); return Effect.succeed(undefined) })
    )
    await Effect.runPromise(prog); setSubmitting(false)
  }

  const card: React.CSSProperties = { borderRadius: 'var(--radius-card)', background: 'var(--color-paper)', padding: '1.5rem', border: '1.5px solid var(--color-rule)', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 2px 8px -4px oklch(20% 0.012 250 / 0.06)' }
  const mono: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }

  return (
    <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'color 180ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-3)' }}>
          <ArrowLeft style={{ height: '1rem', width: '1rem' }} /><span>Kembali</span>
        </button>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>Pencatatan Struk Kasir</span>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', height: '2.75rem', width: '2.75rem', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: 'var(--color-accent)', color: 'var(--color-ink)', boxShadow: '0 3px 0 0 var(--color-accent-deep)' }}>
            <Receipt style={{ height: '1.25rem', width: '1.25rem' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>Rekonsiliasi Struk Belanja</h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>{plan.title}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <div style={{ borderRadius: '14px', background: 'var(--color-paper-2)', padding: '1rem', border: '1.5px solid var(--color-rule)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-ink-3)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>Estimasi Awal</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink)', ...mono }}>Rp{totalEstimated.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ borderRadius: '14px', background: 'oklch(86% 0.18 95 / 0.12)', padding: '1rem', border: '1.5px solid oklch(86% 0.18 95 / 0.25)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent-deep)', fontWeight: 500, fontFamily: 'var(--font-body)' }}>Total Aktual</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-accent-deep)', ...mono }}>Rp{grandTotalActual.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ borderRadius: '14px', padding: '1rem', border: `1.5px solid ${variance > 0 ? 'oklch(68% 0.24 18 / 0.25)' : 'oklch(80% 0.16 150 / 0.25)'}`, background: variance > 0 ? 'oklch(68% 0.24 18 / 0.08)' : 'oklch(80% 0.16 150 / 0.08)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 500, fontFamily: 'var(--font-body)', color: variance > 0 ? 'var(--color-accent-3)' : 'var(--color-mint)' }}>Selisih</div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', color: variance > 0 ? 'var(--color-accent-3)' : 'var(--color-mint)', ...mono }}>
              {variance > 0 ? <><TrendingUp style={{ height: '1rem', width: '1rem' }} /><span>+Rp{variance.toLocaleString('id-ID')}</span></> : <><TrendingDown style={{ height: '1rem', width: '1rem' }} /><span>-Rp{Math.abs(variance).toLocaleString('id-ID')}</span></>}
            </div>
          </div>
        </div>
      </div>

      {error && <div style={{ borderRadius: 'var(--radius-input)', background: 'oklch(68% 0.24 18 / 0.08)', padding: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--color-accent-3)', border: '1.5px solid oklch(68% 0.24 18 / 0.2)', fontFamily: 'var(--font-body)' }}>{error}</div>}

      {/* Planned Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.25rem', fontFamily: 'var(--font-mono)' }}>Barang Terencana ({plan.items?.length ?? 0})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {plan.items?.map((item: PlanItem) => {
            const isSkipped = plannedState[item.id]?.is_skipped
            const actualPrice = Number(plannedState[item.id]?.actual_price) || 0
            const estimatedSubtotal = Number(item.qty) * Number(item.estimated_price)
            const actualSubtotal = Number(item.qty) * actualPrice
            const diff = actualSubtotal - estimatedSubtotal
            return (
              <div key={item.id} style={{ borderRadius: '14px', padding: '1rem', transition: 'all 180ms var(--ease-out)', border: '1.5px solid var(--color-rule)', background: isSkipped ? 'var(--color-paper-2)' : 'var(--color-paper)', opacity: isSkipped ? 0.5 : 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ flex: '1 1 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: isSkipped ? 'var(--color-ink-3)' : 'var(--color-ink)', fontFamily: 'var(--font-body)', textDecoration: isSkipped ? 'line-through' : 'none' }}>{item.item_name}</span>
                      {isSkipped && <span style={{ borderRadius: '6px', background: 'var(--color-paper-3)', padding: '0.125rem 0.375rem', fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>Kosong</span>}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', marginTop: '0.125rem', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{Number(item.qty)} {item.unit} | Est: Rp{Number(item.estimated_price).toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {!isSkipped && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8rem' }}><Input type="number" min="0" step="any" value={actualPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePriceChange(item.id, e.target.value)} placeholder="Harga aktual" /></div>
                        <div style={{ textAlign: 'right', minWidth: '4.5rem' }}>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-ink)', ...mono }}>Rp{actualSubtotal.toLocaleString('id-ID')}</div>
                          {diff !== 0 && <div style={{ fontSize: '0.625rem', fontWeight: 600, color: diff > 0 ? 'var(--color-accent-3)' : 'var(--color-mint)', fontFamily: 'var(--font-mono)' }}>{diff > 0 ? `+${diff.toLocaleString('id-ID')}` : diff.toLocaleString('id-ID')}</div>}
                        </div>
                      </div>
                    )}
                    <button type="button" onClick={() => handleToggleSkip(item.id)} style={{ padding: '0.375rem 0.625rem', borderRadius: 'var(--radius-input)', fontSize: 'var(--text-xs)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1.5px solid var(--color-rule)', background: isSkipped ? 'var(--color-paper-3)' : 'var(--color-paper-2)', color: isSkipped ? 'var(--color-ink)' : 'var(--color-ink-3)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 180ms var(--ease-out)' }}>
                      <MinusCircle style={{ height: '0.875rem', width: '0.875rem' }} /><span>{isSkipped ? 'Aktifkan' : 'Kosong'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unplanned Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.25rem', fontFamily: 'var(--font-mono)' }}>Belanja Dadakan ({unplannedItems.length})</div>
          <Button size="sm" variant="outline" onClick={() => setIsAddUnplannedOpen(true)}><Plus style={{ height: '0.875rem', width: '0.875rem' }} /><span>Tambah Item</span></Button>
        </div>
        {unplannedItems.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {unplannedItems.map((u) => (
              <div key={u._key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px', background: 'oklch(86% 0.18 95 / 0.1)', padding: '1rem', border: '1.5px solid oklch(86% 0.18 95 / 0.25)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-accent-deep)', fontFamily: 'var(--font-body)' }}>{u.item_name}</span>
                    <span style={{ borderRadius: '6px', background: 'oklch(86% 0.18 95 / 0.3)', padding: '0.125rem 0.375rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--color-accent-deep)', fontFamily: 'var(--font-body)' }}>Unplanned</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', marginTop: '0.125rem', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{u.qty} {u.unit} × Rp{Number(u.actual_price).toLocaleString('id-ID')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-accent-deep)', ...mono }}>Rp{(u.qty * u.actual_price).toLocaleString('id-ID')}</div>
                  </div>
                  <button type="button" onClick={() => setUnplannedItems((prev) => prev.filter((item) => item._key !== u._key))} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-accent-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))', background: 'var(--color-paper-glass)', backdropFilter: 'blur(12px)', borderTop: '1.5px solid var(--color-rule)', zIndex: 'var(--z-sticky)' }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>Total Akhir Struk:</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-ink)', ...mono }}>Rp{grandTotalActual.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={onBack}>Batal</Button>
            <Button onClick={handleSubmitReconciliation} disabled={submitting}><Check style={{ height: '1rem', width: '1rem' }} /><span>{submitting ? 'Menyimpan...' : 'Simpan & Update Harga'}</span></Button>
          </div>
        </div>
      </div>

      <Modal open={isAddUnplannedOpen} onOpenChange={setIsAddUnplannedOpen} title="Tambah Belanjaan Dadakan" description="Barang yang dibeli tapi tidak direncanakan">
        <form onSubmit={handleAddUnplannedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-2)', fontFamily: 'var(--font-body)' }}>Nama Barang</label>
            <ItemAutocomplete value={unplannedName} onChange={(name: string, master?: MasterItem) => { setUnplannedName(name); if (master) { setUnplannedPrice(String(master.latest_price)); if (master.category) setUnplannedCategory(master.category) } }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input label="Jumlah (Qty)" type="number" min="0.1" step="any" value={unplannedQty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnplannedQty(e.target.value)} required />
            <Input label="Satuan (Unit)" placeholder="pcs, btl" value={unplannedUnit} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnplannedUnit(e.target.value)} required />
          </div>
          <Input label="Harga Aktual (Rp)" type="number" min="0" step="any" value={unplannedPrice} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnplannedPrice(e.target.value)} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddUnplannedOpen(false)}>Batal</Button>
            <Button type="submit" size="sm">Tambahkan ke Struk</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
