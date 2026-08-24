import React, { useState, useEffect } from 'react'
import { Effect } from 'effect'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { QueueService } from '../services/queue-service'
import { PlanService } from '../services/plan-service'
import type { PlanItem } from '../domain/plan.schema'
import { ShoppingCart, CheckCircle2, ArrowLeft, Wifi, WifiOff, RefreshCw } from 'lucide-react'

export interface InStoreViewProps {
  planId: string; planTitle: string; initialItems: readonly PlanItem[]; onBack: () => void; onProceedToReconcile: () => void
}

export const InStoreView: React.FC<InStoreViewProps> = ({ planId, planTitle, initialItems, onBack, onProceedToReconcile }) => {
  const [items, setItems] = useState<readonly PlanItem[]>(initialItems)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)

  const flushQueue = async () => { setIsSyncing(true); await Effect.runPromise(QueueService.flush()); setIsSyncing(false) }

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); flushQueue() }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  const handleToggleCheck = (itemId: string, currentChecked: boolean) => {
    const nextChecked = !currentChecked
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, is_checked: nextChecked } : item)))
    if (!navigator.onLine) { Effect.runPromise(QueueService.enqueueCheck(planId, itemId, nextChecked)) }
    else { Effect.runPromise(PlanService.checkItem(planId, itemId, nextChecked).pipe(Effect.catchAll(() => QueueService.enqueueCheck(planId, itemId, nextChecked)))) }
  }

  const checkedCount = items.filter((i) => i.is_checked).length
  const totalCount = items.length
  const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0
  const checkedSubtotal = items.filter((i) => i.is_checked).reduce((acc, i) => acc + Number(i.qty) * Number(i.estimated_price), 0)
  const uncheckedItems = items.filter((i) => !i.is_checked)
  const checkedItems = items.filter((i) => i.is_checked)

  const uncheckedRow: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px',
    background: 'var(--color-paper)', padding: '1rem', border: '1.5px solid var(--color-rule)',
    cursor: 'pointer', userSelect: 'none', transition: 'border-color 180ms var(--ease-out)',
  }
  const checkedRow: React.CSSProperties = {
    ...uncheckedRow, background: 'var(--color-paper-2)', opacity: 0.6,
  }

  return (
    <div style={{ maxWidth: '36rem', margin: '0 auto', padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'color 180ms' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-ink-3)' }}>
          <ArrowLeft style={{ height: '1rem', width: '1rem' }} /><span>Kembali</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isOnline ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', borderRadius: 'var(--radius-pill)', padding: '0.25rem 0.625rem', fontSize: '0.6875rem', fontWeight: 700, background: 'oklch(80% 0.16 150 / 0.2)', color: 'var(--color-mint)', fontFamily: 'var(--font-body)' }}>
              <Wifi style={{ height: '0.75rem', width: '0.75rem' }} /><span>Online</span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', borderRadius: 'var(--radius-pill)', padding: '0.25rem 0.625rem', fontSize: '0.6875rem', fontWeight: 700, background: 'oklch(86% 0.18 95 / 0.2)', color: 'var(--color-accent-deep)', fontFamily: 'var(--font-body)' }}>
              <WifiOff style={{ height: '0.75rem', width: '0.75rem' }} /><span>Offline</span>
            </span>
          )}
          {isSyncing && <RefreshCw style={{ height: '0.875rem', width: '0.875rem', color: 'var(--color-ink-3)', animation: 'spin 1s linear infinite' }} />}
        </div>
      </div>

      {/* Progress Card — dark surface */}
      <div style={{ position: 'sticky', top: '0.75rem', zIndex: 'var(--z-sticky)', borderRadius: 'var(--radius-card)', background: 'var(--color-ink)', color: 'var(--color-paper)', padding: '1.25rem', boxShadow: '0 16px 48px -12px oklch(20% 0.012 250 / 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} aria-live="polite">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>Mode Belanja</span>
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-paper)', fontFamily: 'var(--font-display)', lineHeight: 1.3, marginTop: '0.125rem' }}>{planTitle}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{percent}%</span>
            <div style={{ fontSize: '0.625rem', color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)' }}>{checkedCount} dari {totalCount} item</div>
          </div>
        </div>
        <Progress value={percent} colorVariant="mint" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)', paddingTop: '0.5rem', borderTop: '1px solid var(--color-paper-3)', fontFamily: 'var(--font-body)' }}>
          <span style={{ color: 'var(--color-ink-3)' }}>Estimasi di Keranjang:</span>
          <span style={{ fontWeight: 700, color: 'var(--color-paper)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>Rp{checkedSubtotal.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Unchecked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.25rem', fontFamily: 'var(--font-mono)' }}>Belum Diambil ({uncheckedItems.length})</div>
        {uncheckedItems.length === 0 ? (
          <div style={{ borderRadius: 'var(--radius-card)', background: 'var(--color-paper)', padding: '1.5rem', textAlign: 'center', border: '1.5px solid var(--color-rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 style={{ height: '1.5rem', width: '1.5rem', color: 'var(--color-mint)' }} />
            <span style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>Semua barang sudah masuk keranjang!</span>
          </div>
        ) : uncheckedItems.map((item) => (
          <div key={item.id} onClick={() => handleToggleCheck(item.id, item.is_checked)} style={uncheckedRow}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-mint)' }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <Checkbox checked={item.is_checked} />
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}>{item.item_name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{Number(item.qty)} {item.unit}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>Rp{(Number(item.qty) * Number(item.estimated_price)).toLocaleString('id-ID')}</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)' }}>@Rp{Number(item.estimated_price).toLocaleString('id-ID')}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Checked */}
      {checkedItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.25rem', fontFamily: 'var(--font-mono)' }}>Sudah di Keranjang ({checkedItems.length})</div>
          {checkedItems.map((item) => (
            <div key={item.id} onClick={() => handleToggleCheck(item.id, item.is_checked)} style={checkedRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <Checkbox checked={item.is_checked} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-ink-3)', fontFamily: 'var(--font-body)', textDecoration: 'line-through' }}>{item.item_name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{Number(item.qty)} {item.unit}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-3)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', textDecoration: 'line-through' }}>Rp{(Number(item.qty) * Number(item.estimated_price)).toLocaleString('id-ID')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Bottom Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'var(--color-paper-glass)', backdropFilter: 'blur(12px)', borderTop: '1.5px solid var(--color-rule)', zIndex: 'var(--z-sticky)' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto', display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={onBack} style={{ flex: 1 }}>Kembali</Button>
          <Button onClick={onProceedToReconcile} style={{ flex: 1 }}><ShoppingCart style={{ height: '1rem', width: '1rem' }} /><span>Selesai & Rekonsiliasi</span></Button>
        </div>
      </div>
    </div>
  )
}
