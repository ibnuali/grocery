import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { ShoppingCart, AlertCircle } from 'lucide-react'

export const LoginView: React.FC = () => {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [householdName, setHouseholdName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (isRegister) {
      const res = await register(username, password, fullName, householdName)
      if (!res.success) {
        setError(res.error || 'Registration failed')
      }
    } else {
      const res = await login(username, password)
      if (!res.success) {
        setError(res.error || 'Invalid username or password')
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100/30">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 mb-4">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isRegister ? 'Buat Akun Baru' : 'Grocery Planner'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 max-w-xs">
            {isRegister
              ? 'Mulai rencanakan belanja bulanan keluarga dengan estimasi akurat'
              : 'Masuk untuk mengelola rencana belanja dan melacak riwayat harga'}
          </p>
        </div>

        {error && (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200/60">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <>
              <div className="relative">
                <Input
                  label="Nama Lengkap"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="relative">
                <Input
                  label="Nama Keluarga / Household"
                  placeholder="Contoh: Keluarga Santoso"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="relative">
            <Input
              label="Username"
              placeholder="Username anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type="password"
              placeholder="Minimal 4 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading} size="lg">
            {loading
              ? 'Memproses...'
              : isRegister
              ? 'Daftar Sekarang'
              : 'Masuk ke Aplikasi'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
            }}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
          >
            {isRegister
              ? 'Sudah punya akun? Masuk di sini'
              : 'Belum punya akun? Daftar household baru'}
          </button>
        </div>
      </div>
    </div>
  )
}
