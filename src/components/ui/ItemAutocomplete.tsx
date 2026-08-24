import React, { useState, useEffect, useRef } from 'react'
import { Effect } from 'effect'
import { CatalogService } from '../../services/CatalogService'
import type { MasterItem } from '../../domain/catalog.schema'
import { Search, Plus, Tag } from 'lucide-react'

export interface ItemAutocompleteProps {
  value: string
  onChange: (name: string, item?: MasterItem) => void
  placeholder?: string
  className?: string
}

export const ItemAutocomplete: React.FC<ItemAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Ketik nama barang (contoh: Susu UHT 1L)...',
  className = ''
}) => {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<readonly MasterItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const timer = setTimeout(() => {
      setLoading(true)
      const prog = CatalogService.searchItems(query).pipe(
        Effect.map((items) => {
          setResults(items)
          setLoading(false)
        }),
        Effect.catchAll(() => {
          setResults([])
          setLoading(false)
          return Effect.succeed(undefined)
        })
      )
      Effect.runPromise(prog)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, isOpen])

  const handleSelect = (item: MasterItem) => {
    setQuery(item.name)
    onChange(item.name, item)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value
    setQuery(nextVal)
    onChange(nextVal, undefined)
    setIsOpen(true)
  }

  const exactMatch = results.find((r) => r.name.toLowerCase() === query.trim().toLowerCase())

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/80 max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-3 text-center text-xs text-slate-400">Mencari katalog...</div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Katalog Master Tersimpan
              </div>
              {results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="font-semibold text-slate-800 group-hover:text-emerald-800">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Tag className="h-3 w-3" />
                      <span>{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">
                      Rp{Number(item.latest_price).toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400">harga terakhir</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!loading && query.trim() !== '' && !exactMatch && (
            <div className="mt-1 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onChange(query.trim(), undefined)
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Gunakan barang baru "{query.trim()}" (akan otomatis masuk katalog)</span>
              </button>
            </div>
          )}

          {!loading && results.length === 0 && query.trim() === '' && (
            <div className="p-3 text-center text-xs text-slate-400">
              Ketik nama barang untuk mencari atau menambahkan barang baru
            </div>
          )}
        </div>
      )}
    </div>
  )
}
