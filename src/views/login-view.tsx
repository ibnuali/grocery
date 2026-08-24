import React, { useState } from 'react'
import { useAuth } from '../hooks/use-auth'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
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
      if (!res.success) setError(res.error || 'Registration failed')
    } else {
      const res = await login(username, password)
      if (!res.success) setError(res.error || 'Invalid username or password')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--color-paper)' }}>
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'oklch(86% 0.18 95 / 0.15)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '26rem', borderRadius: 'var(--radius-card)', background: 'var(--color-paper)', padding: '2rem', boxShadow: '0 24px 64px -16px oklch(20% 0.012 250 / 0.12)', border: '1.5px solid var(--color-rule)', position: 'relative' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ display: 'flex', height: '3.5rem', width: '3.5rem', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', background: 'var(--color-accent)', color: 'var(--color-ink)', boxShadow: '0 4px 0 0 var(--color-accent-deep), 0 8px 20px -6px oklch(86% 0.18 95 / 0.5)', marginBottom: '1rem' }}>
            <ShoppingCart style={{ height: '1.75rem', width: '1.75rem' }} />
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--color-ink)', fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
            {isRegister ? 'Buat Akun Baru' : 'Grocery Planner'}
          </h1>
          <p style={{ marginTop: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--color-ink-3)', maxWidth: '20rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
            {isRegister ? 'Mulai rencanakan belanja bulanan keluarga dengan estimasi akurat' : 'Masuk untuk mengelola rencana belanja dan melacak riwayat harga'}
          </p>
        </div>
        {error && (
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.625rem', borderRadius: 'var(--radius-input)', background: 'oklch(68% 0.24 18 / 0.08)', padding: '0.75rem 0.875rem', fontSize: 'var(--text-xs)', color: 'var(--color-accent-3)', border: '1.5px solid oklch(68% 0.24 18 / 0.2)', fontFamily: 'var(--font-body)' }}>
            <AlertCircle style={{ height: '1rem', width: '1rem', flexShrink: 0 }} />
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <>
              <Input label="Nama Lengkap" placeholder="Contoh: Budi Santoso" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <Input label="Nama Keluarga / Household" placeholder="Contoh: Keluarga Santoso" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} />
            </>
          )}
          <Input label="Username" placeholder="Username anda" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          <Input label="Password" type="password" placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <Button type="submit" size="lg" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}
          </Button>
        </form>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1.5px solid var(--color-rule)', textAlign: 'center' }}>
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null) }} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent-2)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  )
}
