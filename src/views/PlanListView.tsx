import React, { useState, useEffect } from 'react'
import { Effect } from 'effect'
import { PlanService } from '../services/PlanService'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import type { ShoppingPlan } from '../domain/plan.schema'
import { Plus, Calendar, ChevronRight, ShoppingBag, LogOut } from 'lucide-react'

export interface PlanListViewProps {
  onSelectPlan: (planId: string) => void
  onLogout: () => void
}

export const PlanListView: React.FC<PlanListViewProps> = ({ onSelectPlan, onLogout }) => {
  const [plans, setPlans] = useState<readonly ShoppingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [budgetTarget, setBudgetTarget] = useState(1500000)
  const [shoppingDate, setShoppingDate] = useState(new Date().toISOString().split('T')[0])
  const [creating, setCreating] = useState(false)

  const loadPlans = async () => {
    setLoading(true)
    const prog = PlanService.listPlans().pipe(
      Effect.map((data) => {
        setPlans(data)
        setLoading(false)
      }),
      Effect.catchAll(() => {
        setPlans([])
        setLoading(false)
        return Effect.succeed(undefined)
      })
    )
    await Effect.runPromise(prog)
  }

  useEffect(() => {
    loadPlans()
  }, [])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setCreating(true)

    const prog = PlanService.createPlan(title.trim(), budgetTarget, shoppingDate).pipe(
      Effect.map((newPlan) => {
        setIsCreateOpen(false)
        setTitle('')
        setCreating(false)
        onSelectPlan(newPlan.id)
      }),
      Effect.catchAll(() => {
        setCreating(false)
        return Effect.succeed(undefined)
      })
    )

    await Effect.runPromise(prog)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Top Navbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rencana Belanja</h1>
          <p className="text-xs text-slate-500">Kelola dan estimasi belanja bulanan keluarga</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 shadow-md shadow-emerald-500/20">
            <Plus className="h-4 w-4" />
            <span>Buat Rencana</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-400 hover:text-rose-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Plan list */}
      {loading ? (
        <div className="rounded-3xl bg-white p-12 text-center border border-slate-100 text-slate-400 text-sm">
          Memuat daftar rencana...
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Belum ada Rencana Belanja</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
              Buat rencana belanja baru untuk mulai memasukkan daftar belanjaan dan menghitung estimasi otomatis.
            </p>
          </div>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5 mt-2">
            <Plus className="h-4 w-4" />
            <span>Buat Rencana Pertama</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((p) => {
            const isCompleted = p.status === 'COMPLETED'
            return (
              <div
                key={p.id}
                onClick={() => onSelectPlan(p.id)}
                className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-xs border border-slate-100 hover:border-emerald-200 hover:shadow-md hover:shadow-slate-200/50 transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                      {p.title}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isCompleted ? 'Selesai Rekonsiliasi' : 'Planning'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {p.shopping_date ? p.shopping_date.substring(0, 10) : '-'}
                    </span>
                    <span>•</span>
                    <span>
                      Target Budget: <strong className="text-slate-700 font-semibold">Rp{Number(p.budget_target).toLocaleString('id-ID')}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Create Plan */}
      <Modal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Buat Rencana Belanja Baru"
        description="Tetapkan nama periode belanja dan target anggaran belanja"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama / Judul Rencana"
            placeholder="Contoh: Belanja Bulanan Mei 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Target Anggaran / Budget (Rp)"
            type="number"
            min="0"
            step="10000"
            value={budgetTarget}
            onChange={(e) => setBudgetTarget(parseFloat(e.target.value) || 0)}
            required
          />

          <Input
            label="Tanggal Rencana Belanja"
            type="date"
            value={shoppingDate}
            onChange={(e) => setShoppingDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={creating}>
              {creating ? 'Menyimpan...' : 'Buat Rencana'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
