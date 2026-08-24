import React, { useState } from 'react'
import { Effect } from 'effect'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ItemAutocomplete } from '../components/ui/ItemAutocomplete'
import { ReconciliationService, type PlannedItemReconcile, type UnplannedItemReconcile } from '../services/ReconciliationService'
import type { PlanItem, ShoppingPlan } from '../domain/plan.schema'
import type { MasterItem } from '../domain/catalog.schema'
import { Receipt, Plus, ArrowLeft, TrendingUp, TrendingDown, MinusCircle, Check } from 'lucide-react'

export interface ReconciliationViewProps {
  plan: ShoppingPlan
  onSuccess: (updatedPlan: ShoppingPlan) => void
  onBack: () => void
}

interface PlannedFormState {
  [id: string]: {
    actual_price: number
    is_skipped: boolean
  }
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({
  plan,
  onSuccess,
  onBack
}) => {
  const [plannedState, setPlannedState] = useState<PlannedFormState>(() => {
    const state: PlannedFormState = {}
    plan.items?.forEach((item: PlanItem) => {
      state[item.id] = {
        actual_price: Number(item.actual_price ?? item.estimated_price),
        is_skipped: Boolean(item.is_skipped)
      }
    })
    return state
  })

  const [unplannedItems, setUnplannedItems] = useState<UnplannedItemReconcile[]>([])
  const [isAddUnplannedOpen, setIsAddUnplannedOpen] = useState(false)
  const [unplannedName, setUnplannedName] = useState('')
  const [unplannedCategory, setUnplannedCategory] = useState('General')
  const [unplannedQty, setUnplannedQty] = useState(1)
  const [unplannedUnit, setUnplannedUnit] = useState('pcs')
  const [unplannedPrice, setUnplannedPrice] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePriceChange = (id: string, price: number) => {
    setPlannedState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        actual_price: price
      }
    }))
  }

  const handleToggleSkip = (id: string) => {
    setPlannedState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        is_skipped: !prev[id]?.is_skipped
      }
    }))
  }

  const handleAddUnplannedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!unplannedName.trim()) return
    setUnplannedItems((prev) => [
      ...prev,
      {
        item_name: unplannedName.trim(),
        category: unplannedCategory.trim() || 'General',
        qty: Number(unplannedQty) || 1,
        unit: unplannedUnit.trim() || 'pcs',
        actual_price: Number(unplannedPrice) || 0
      }
    ])
    setIsAddUnplannedOpen(false)
    setUnplannedName('')
    setUnplannedQty(1)
    setUnplannedUnit('pcs')
    setUnplannedPrice(0)
  }

  // Calculate totals
  const totalEstimated =
    plan.items?.reduce((acc: number, item: PlanItem) => {
      if (plannedState[item.id]?.is_skipped) return acc
      return acc + Number(item.qty) * Number(item.estimated_price)
    }, 0) ?? 0

  const plannedActualTotal =
    plan.items?.reduce((acc: number, item: PlanItem) => {
      const state = plannedState[item.id]
      if (state?.is_skipped) return acc
      return acc + Number(item.qty) * (state?.actual_price ?? 0)
    }, 0) ?? 0

  const unplannedActualTotal = unplannedItems.reduce((acc, item) => {
    return acc + Number(item.qty) * Number(item.actual_price)
  }, 0)

  const grandTotalActual = plannedActualTotal + unplannedActualTotal
  const variance = grandTotalActual - totalEstimated
  const variancePercent = totalEstimated > 0 ? ((variance / totalEstimated) * 100).toFixed(1) : '0'

  const handleSubmitReconciliation = async () => {
    setSubmitting(true)
    setError(null)

    const plannedPayload: PlannedItemReconcile[] = Object.entries(plannedState).map(([id, val]) => ({
      id,
      actual_price: val.actual_price,
      is_skipped: val.is_skipped
    }))

    const prog = ReconciliationService.reconcile(plan.id, plannedPayload, unplannedItems).pipe(
      Effect.map((updatedPlan) => {
        onSuccess(updatedPlan)
      }),
      Effect.catchAll((err: { message?: string }) => {
        setError(err.message || 'Gagal menyimpan rekonsiliasi')
        return Effect.succeed(undefined)
      })
    )

    await Effect.runPromise(prog)
    setSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>
        <span className="text-xs text-slate-400">Pencatatan Struk Kasir</span>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Rekonsiliasi Struk Belanja</h1>
            <p className="text-xs text-slate-500">{plan.title}</p>
          </div>
        </div>

        {/* Variance Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">Estimasi Awal</div>
            <div className="text-base font-bold text-slate-800">
              Rp{totalEstimated.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
            <div className="text-[11px] text-emerald-800 font-medium">Total Struk Aktual</div>
            <div className="text-lg font-black text-emerald-700">
              Rp{grandTotalActual.toLocaleString('id-ID')}
            </div>
          </div>

          <div
            className={`rounded-2xl p-4 border ${
              variance > 0
                ? 'bg-rose-50 border-rose-100 text-rose-800'
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}
          >
            <div className="text-[11px] font-medium">Selisih / Deviasi</div>
            <div className="text-base font-bold flex items-center gap-1">
              {variance > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-rose-600" />
                  <span>+Rp{variance.toLocaleString('id-ID')} (+{variancePercent}%)</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                  <span>-Rp{Math.abs(variance).toLocaleString('id-ID')} ({variancePercent}%)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {/* Planned Items Section */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Barang Terencana (Input Harga dari Struk)
        </div>

        <div className="space-y-2">
          {plan.items?.map((item: PlanItem) => {
            const isSkipped = plannedState[item.id]?.is_skipped
            const actualPrice = plannedState[item.id]?.actual_price ?? 0
            const estimatedSubtotal = Number(item.qty) * Number(item.estimated_price)
            const actualSubtotal = Number(item.qty) * actualPrice
            const diff = actualSubtotal - estimatedSubtotal

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 transition-all border ${
                  isSkipped
                    ? 'bg-slate-50 border-slate-200/60 opacity-50'
                    : 'bg-white border-slate-100 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isSkipped ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {item.item_name}
                      </span>
                      {isSkipped && (
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          Kosong / Batal
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {Number(item.qty)} {item.unit} | Estimasi: Rp{Number(item.estimated_price).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isSkipped && (
                      <div className="flex items-center gap-2">
                        <div className="w-32">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={actualPrice}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                            }
                            placeholder="Harga aktual"
                            className="text-right py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div className="text-right min-w-[70px]">
                          <div className="text-xs font-black text-slate-800">
                            Rp{actualSubtotal.toLocaleString('id-ID')}
                          </div>
                          {diff !== 0 && (
                            <div
                              className={`text-[10px] font-semibold ${
                                diff > 0 ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {diff > 0 ? `+${diff.toLocaleString('id-ID')}` : diff.toLocaleString('id-ID')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleToggleSkip(item.id)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isSkipped
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title={isSkipped ? 'Kembalikan barang' : 'Tandai stok kosong / dibatalkan'}
                    >
                      <MinusCircle className="h-3.5 w-3.5" />
                      <span>{isSkipped ? 'Aktifkan' : 'Kosong'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unplanned Items Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Belanja Dadakan / Unplanned Items ({unplannedItems.length})
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddUnplannedOpen(true)}
            className="gap-1 text-xs py-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Item Struk</span>
          </Button>
        </div>

        {unplannedItems.length > 0 && (
          <div className="space-y-2">
            {unplannedItems.map((u, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-2xl bg-amber-50/60 p-4 border border-amber-200/70 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-amber-900">{u.item_name}</span>
                    <span className="rounded-md bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                      Unplanned
                    </span>
                  </div>
                  <div className="text-xs text-amber-700 mt-0.5">
                    {u.qty} {u.unit} × Rp{Number(u.actual_price).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-900">
                      Rp{(u.qty * u.actual_price).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setUnplannedItems((prev) => prev.filter((_, i) => i !== idx))
                    }
                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200/70 z-40">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">Total Akhir Struk:</div>
            <div className="text-lg font-black text-slate-900">
              Rp{grandTotalActual.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitReconciliation}
              disabled={submitting}
              className="gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              <Check className="h-4 w-4" />
              <span>{submitting ? 'Menyimpan...' : 'Simpan & Update Harga Master'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Add Unplanned Item */}
      <Modal
        open={isAddUnplannedOpen}
        onOpenChange={setIsAddUnplannedOpen}
        title="Tambah Belanjaan Dadakan (Unplanned)"
        description="Barang yang dibeli di kasir tapi tidak direncanakan sebelumnya"
      >
        <form onSubmit={handleAddUnplannedSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Nama Barang</label>
            <ItemAutocomplete
              value={unplannedName}
              onChange={(name: string, master?: MasterItem) => {
                setUnplannedName(name)
                if (master) {
                  setUnplannedPrice(Number(master.latest_price))
                  if (master.category) setUnplannedCategory(master.category)
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jumlah (Qty)"
              type="number"
              min="0.1"
              step="any"
              value={unplannedQty}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnplannedQty(parseFloat(e.target.value) || 1)}
              required
            />
            <Input
              label="Satuan (Unit)"
              placeholder="pcs, btl"
              value={unplannedUnit}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnplannedUnit(e.target.value)}
              required
            />
          </div>

          <Input
            label="Harga Satuan Aktual di Struk (Rp)"
            type="number"
            min="0"
            step="any"
            value={unplannedPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnplannedPrice(parseFloat(e.target.value) || 0)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddUnplannedOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm">
              Tambahkan ke Struk
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
