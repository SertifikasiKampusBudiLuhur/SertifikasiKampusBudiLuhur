'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
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
        <p className="text-slate-500 text-sm mb-6">Masukkan email dan password yang terdaftar</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input" placeholder="mahasiswa@kampus.ac.id" required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input" placeholder="••••••••" required
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
  )
}
