import React, { useState } from 'react'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { BudgetBar } from '../components/ui/BudgetBar'
import { ItemAutocomplete } from '../components/ui/ItemAutocomplete'
import { Plus, Trash2, Calendar, ShoppingBag, ArrowRight } from 'lucide-react'
import type { MasterItem } from '../domain/catalog.schema'
import type { PlanItem } from '../domain/plan.schema'

export interface PlanDetailViewProps {
  planTitle: string
  shoppingDate: string
  budgetTarget: number
  items: readonly PlanItem[]
  onAddItem: (item: {
    itemName: string
    qty: number
    unit: string
    estimatedPrice: number
    category: string
  }) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
  onStartShopping: () => void
  onReconcile: () => void
  onBack: () => void
}

export const PlanDetailView: React.FC<PlanDetailViewProps> = ({
  planTitle,
  shoppingDate,
  budgetTarget,
  items,
  onAddItem,
  onDeleteItem,
  onStartShopping,
  onReconcile,
  onBack
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState('General')
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState('pcs')
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleAutocompleteChange = (name: string, master?: MasterItem) => {
    setItemName(name)
    if (master) {
      setEstimatedPrice(Number(master.latest_price))
      if (master.category) setCategory(master.category)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName.trim()) return
    setSubmitting(true)
    await onAddItem({
      itemName: itemName.trim(),
      category: category.trim() || 'General',
      qty: Number(qty) || 1,
      unit: unit.trim() || 'pcs',
      estimatedPrice: Number(estimatedPrice) || 0
    })
    setSubmitting(false)
    setIsAddOpen(false)
    setItemName('')
    setQty(1)
    setUnit('pcs')
    setEstimatedPrice(0)
  }

  const totalEstimated = items.reduce((acc, item) => {
    return acc + Number(item.qty) * Number(item.estimated_price)
  }, 0)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          ← Kembali ke Daftar
        </button>
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {shoppingDate}
        </span>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{planTitle}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Target Anggaran: <span className="font-semibold text-slate-700">Rp{budgetTarget.toLocaleString('id-ID')}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onReconcile}>
              Rekonsiliasi Struk
            </Button>
            <Button size="sm" onClick={onStartShopping} className="gap-1.5">
              <span>Mulai Belanja</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Budget bar visualizer */}
        <BudgetBar totalEstimated={totalEstimated} budgetTarget={budgetTarget} />

        {/* Budget overview card */}
        <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-800 font-medium">Estimasi Total Belanja</div>
            <div className="text-xl font-black text-emerald-700">
              Rp{totalEstimated.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Jumlah Item</div>
            <div className="text-base font-bold text-slate-700">{items.length} item</div>
          </div>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Daftar Barang ({items.length})</h2>
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            <span>Tambah Item</span>
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-700">Belum ada barang di daftar</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Tambahkan barang pertama untuk mulai menghitung estimasi belanja otomatis
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddOpen(true)}
              className="mt-4 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Barang Sekarang</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const subtotal = Number(item.qty) * Number(item.estimated_price)
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-xs border border-slate-100 hover:border-slate-200 transition-all"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-800">{item.item_name}</div>
                    <div className="text-xs text-slate-400">
                      {Number(item.qty)} {item.unit} × Rp{Number(item.estimated_price).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-800">
                        Rp{subtotal.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-400">subtotal estimasi</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Add Item */}
      <Modal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Barang Belanja"
        description="Pilih dari katalog tersimpan atau ketik nama barang baru untuk auto-insert"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Nama Barang</label>
            <ItemAutocomplete value={itemName} onChange={handleAutocompleteChange} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jumlah (Qty)"
              type="number"
              min="0.1"
              step="any"
              value={qty}
              onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
              required
            />
            <Input
              label="Satuan (Unit)"
              placeholder="pcs, kg, btl, bks"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <Input
            label="Estimasi Harga Satuan (Rp)"
            type="number"
            min="0"
            step="any"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(parseFloat(e.target.value) || 0)}
            required
          />

          <div className="rounded-xl bg-slate-50 p-3 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Subtotal Estimasi:</span>
            <span className="font-bold text-slate-800 text-sm">
              Rp{(qty * estimatedPrice).toLocaleString('id-ID')}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tambahkan ke Daftar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
