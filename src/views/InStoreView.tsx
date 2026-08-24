import React, { useState, useEffect } from 'react'
import { Effect } from 'effect'
import { Checkbox } from '../components/ui/Checkbox'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { QueueService } from '../services/QueueService'
import type { PlanItem } from '../domain/plan.schema'
import { ShoppingCart, CheckCircle2, ArrowLeft, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export interface InStoreViewProps {
  planId: string
  planTitle: string
  initialItems: readonly PlanItem[]
  onBack: () => void
  onProceedToReconcile: () => void
}

export const InStoreView: React.FC<InStoreViewProps> = ({
  planId,
  planTitle,
  initialItems,
  onBack,
  onProceedToReconcile
}) => {
  const [items, setItems] = useState<readonly PlanItem[]>(initialItems)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)

  const flushQueue = async () => {
    setIsSyncing(true)
    await Effect.runPromise(QueueService.flush())
    setIsSyncing(false)
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      flushQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleToggleCheck = (itemId: string, currentChecked: boolean) => {
    const nextChecked = !currentChecked

    // 1. Optimistic local state update
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, is_checked: nextChecked } : item))
    )

    // 2. Enqueue offline mutation or send online
    if (!navigator.onLine) {
      Effect.runPromise(QueueService.enqueueCheck(planId, itemId, nextChecked))
    } else {
      fetch(`/api/v1/plans/${planId}/items/${itemId}/check`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('grocery_auth_token')}`
        },
        body: JSON.stringify({ is_checked: nextChecked })
      }).catch(() => {
        Effect.runPromise(QueueService.enqueueCheck(planId, itemId, nextChecked))
      })
    }
  }

  const checkedCount = items.filter((i) => i.is_checked).length
  const totalCount = items.length
  const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  const checkedSubtotal = items
    .filter((i) => i.is_checked)
    .reduce((acc, i) => acc + Number(i.qty) * Number(i.estimated_price), 0)

  const uncheckedItems = items.filter((i) => !i.is_checked)
  const checkedItems = items.filter((i) => i.is_checked)

  return (
    <div className="mx-auto max-w-xl px-4 py-5 space-y-5 pb-24">
      {/* Header with Network Indicator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <Wifi className="h-3 w-3" />
              <span>Online</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
              <WifiOff className="h-3 w-3" />
              <span>Offline Mode (Queue Active)</span>
            </span>
          )}

          {isSyncing && <RefreshCw className="h-3.5 w-3.5 text-slate-400 animate-spin" />}
        </div>
      </div>

      {/* Progress Card Sticky Header */}
      <div className="sticky top-3 z-30 rounded-3xl bg-slate-900 text-white p-5 shadow-xl shadow-slate-900/20 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Mode Belanja di Supermarket
            </span>
            <h1 className="text-lg font-bold text-white leading-tight">{planTitle}</h1>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400">{percent}%</span>
            <div className="text-[10px] text-slate-400">
              {checkedCount} dari {totalCount} item
            </div>
          </div>
        </div>

        <Progress value={percent} colorVariant="emerald" className="h-2 bg-slate-800" />

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
          <span className="text-slate-400">Estimasi di Keranjang:</span>
          <span className="font-bold text-white">Rp{checkedSubtotal.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {/* Unchecked Items */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Belum Diambil ({uncheckedItems.length})
          </div>

          {uncheckedItems.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center border border-slate-100 text-xs text-slate-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              <span className="font-semibold text-slate-700">Semua barang sudah masuk keranjang!</span>
            </div>
          ) : (
            uncheckedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleCheck(item.id, item.is_checked)}
                className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-xs border border-slate-100 active:scale-[0.99] transition-all cursor-pointer select-none hover:border-emerald-200"
              >
                <div className="flex items-center gap-3.5">
                  <Checkbox
                    checked={item.is_checked}
                    onCheckedChange={() => handleToggleCheck(item.id, item.is_checked)}
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800">{item.item_name}</div>
                    <div className="text-xs text-slate-400">
                      {Number(item.qty)} {item.unit}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">
                    Rp{(Number(item.qty) * Number(item.estimated_price)).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400">@Rp{Number(item.estimated_price).toLocaleString('id-ID')}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checked Items */}
        {checkedItems.length > 0 && (
          <div className="space-y-2 pt-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Sudah di Keranjang ({checkedItems.length})
            </div>

            {checkedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleToggleCheck(item.id, item.is_checked)}
                className="flex items-center justify-between rounded-2xl bg-slate-50/80 p-4 border border-slate-200/60 opacity-60 active:scale-[0.99] transition-all cursor-pointer select-none line-through"
              >
                <div className="flex items-center gap-3.5">
                  <Checkbox
                    checked={item.is_checked}
                    onCheckedChange={() => handleToggleCheck(item.id, item.is_checked)}
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-600">{item.item_name}</div>
                    <div className="text-xs text-slate-400">
                      {Number(item.qty)} {item.unit}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">
                    Rp{(Number(item.qty) * Number(item.estimated_price)).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200/60 z-40">
        <div className="mx-auto max-w-xl flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            Kembali ke Detail
          </Button>
          <Button
            className="flex-1 shadow-lg shadow-emerald-600/30 gap-1.5"
            onClick={onProceedToReconcile}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Selesai & Rekonsiliasi Struk</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
