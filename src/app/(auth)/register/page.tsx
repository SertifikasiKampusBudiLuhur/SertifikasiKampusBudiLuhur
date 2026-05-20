'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PRODI_OPTIONS = [
  'Teknik Informatika', 'Sistem Informasi', 'Manajemen Informatika',
  'Teknik Elektro', 'Teknik Mesin', 'Akuntansi', 'Manajemen',
  'Ilmu Komunikasi', 'Hukum', 'Kedokteran', 'Lainnya',
]

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    nim: '', nama_lengkap: '', program_studi: '', angkatan: '',
    no_wa: '', email: '', password: '', konfirmasi_password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.konfirmasi_password) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          nim: form.nim,
          nama_lengkap: form.nama_lengkap,
          program_studi: form.program_studi,
          angkatan: form.angkatan,
          no_wa: form.no_wa,
          role: 'mahasiswa',
        },
      },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Email sudah terdaftar. Silakan login.'
        : error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>

        <div className="card w-full p-8">
          <div className="mb-6">
            <Image
              src="/logo/Logo BLU Horizontal Colour.png"
              alt="BLU"
              width={160}
              height={52}
              className="h-12 w-auto"
              priority
            />
          </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Buat Akun Baru</h1>
        <p className="text-slate-500 text-sm mb-6">Lengkapi data diri untuk mendaftar</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">NIM <span className="text-red-500">*</span></label>
              <input name="nim" value={form.nim} onChange={handleChange}
                className="input" placeholder="2021001234" required />
            </div>
            <div>
              <label className="label">Angkatan <span className="text-red-500">*</span></label>
              <input name="angkatan" value={form.angkatan} onChange={handleChange}
                className="input" placeholder="2021" maxLength={4} required />
            </div>
          </div>

          <div>
            <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
            <input name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange}
              className="input" placeholder="Nama sesuai KTM" required />
          </div>

          <div>
            <label className="label">Program Studi <span className="text-red-500">*</span></label>
            <select name="program_studi" value={form.program_studi} onChange={handleChange}
              className="input" required>
              <option value="">Pilih Program Studi</option>
              {PRODI_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Nomor WhatsApp <span className="text-slate-400">(opsional)</span></label>
            <input name="no_wa" value={form.no_wa} onChange={handleChange}
              className="input" placeholder="08123456789" />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div>
              <label className="label">Email Aktif <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input" placeholder="email@kampus.ac.id" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Password <span className="text-red-500">*</span></label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                className="input" placeholder="Min. 8 karakter" required />
            </div>
            <div>
              <label className="label">Konfirmasi Password <span className="text-red-500">*</span></label>
              <input type="password" name="konfirmasi_password" value={form.konfirmasi_password}
                onChange={handleChange} className="input" placeholder="Ulangi password" required />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-2.5 mt-2" disabled={loading}>
            {loading ? 'Membuat akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Masuk</Link>
        </p>
        </div>
      </div>
    </div>
  )
}
