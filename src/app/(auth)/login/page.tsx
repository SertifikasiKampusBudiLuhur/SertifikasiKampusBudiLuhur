'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [nim, setNim] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Resolve NIM → email via server-side lookup
    const res = await fetch('/api/auth/nim-to-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nim: nim.trim() }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'NIM tidak ditemukan.')
      setLoading(false)
      return
    }

    const { email } = await res.json()

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('NIM atau password salah.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        <div className="card w-full p-8">
          <div className="mb-8">
            <Image
              src="/logo/Logo BLU Horizontal Colour.png"
              alt="BLU"
              width={160}
              height={52}
              className="h-12 w-auto"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Masuk ke Akun</h1>
          <p className="text-slate-500 text-sm mb-6">Masukkan NIM dan password yang terdaftar</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">NIM</label>
              <input
                type="text"
                value={nim}
                onChange={e => setNim(e.target.value)}
                className="input"
                placeholder="2021001234"
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              Daftar sekarang
            </Link>
          </p>
          <p className="text-center text-xs text-slate-400 mt-2">
            Admin?{' '}
            <Link href="/admin/login" className="hover:underline">Login Admin</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
