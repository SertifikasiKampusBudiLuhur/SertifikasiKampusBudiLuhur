'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import { CertificationProgram, Profile } from '@/types'

declare global {
  interface Window { snap: any }
}

export default function DaftarPage({ params }: { params: { programId: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [program, setProgram] = useState<CertificationProgram | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [jadwal, setJadwal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load Midtrans Snap.js
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
    document.head.appendChild(script)

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: prog }, { data: prof }] = await Promise.all([
        supabase.from('certification_programs').select('*').eq('id', params.programId).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])

      setProgram(prog)
      setProfile(prof)
      setLoadingPage(false)
    }
    loadData()

    return () => { document.head.removeChild(script) }
  }, [])

  async function handleBayar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Buat record registrasi
      const { data: reg, error: regError } = await supabase
      .from('registrations')
      .insert({
        user_id: user!.id,
        program_id: params.programId,
        jadwal_pilihan: jadwal,
        catatan: catatan,
        status: 'DRAFT',
      })
      .select()
      .single()

    if (regError || !reg?.id) {  // ← tambah !reg?.id
      if (regError?.code === '23505') {
        setError('Kamu sudah mendaftar program ini sebelumnya.')
      } else {
        setError('Gagal membuat pendaftaran: ' + (regError?.message ?? 'Unknown error'))
      }
      setLoading(false)
      return
    }


      // 2. Generate Snap token via API
      const res = await fetch('/api/midtrans/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registration_id: reg.id }),
      })
      const { snap_token, error: tokenError } = await res.json()

      if (tokenError || !snap_token) {
        setError('Gagal membuat token pembayaran. Coba lagi.')
        setLoading(false)
        return
      }

      // 3. Buka Midtrans Snap popup
      window.snap.pay(snap_token, {
        onSuccess: () => { router.push('/riwayat?payment=success') },
        onPending: () => { router.push('/riwayat?payment=pending') },
        onError: () => { setError('Pembayaran gagal. Silakan coba lagi.'); setLoading(false) },
        onClose: () => { setLoading(false) },
      })
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setLoading(false)
    }
  }

  if (loadingPage) {
    return <div className="p-8 text-center text-slate-400">Memuat data...</div>
  }

  if (!program) {
    return <div className="p-8 text-center text-slate-400">Program tidak ditemukan.</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href={`/programs/${program.id}`}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm">
        <ArrowLeft size={16} /> Kembali ke Detail Program
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Form Pendaftaran</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Program summary */}
      <div className="card p-4 mb-6 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-500 font-medium mb-1">Program yang dipilih</p>
        <p className="font-bold text-slate-800">{program.nama}</p>
        <p className="text-blue-700 font-semibold mt-1">
          {program.biaya === 0 ? 'Gratis' : formatRupiah(program.biaya)}
        </p>
      </div>

      {/* Konfirmasi data diri */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-slate-700 mb-4">Konfirmasi Data Diri</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Nama Lengkap', profile?.nama_lengkap],
            ['NIM', profile?.nim],
            ['Program Studi', profile?.program_studi],
            ['Angkatan', profile?.angkatan],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-slate-400">{label}</p>
              <p className="font-medium text-slate-800">{val}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleBayar} className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">Detail Pendaftaran</h2>
        <div>
          <label className="label">Jadwal Pilihan</label>
          <input value={jadwal} onChange={e => setJadwal(e.target.value)}
            className="input" placeholder="Contoh: Sesi Pagi (08.00–12.00)" required />
        </div>
        <div>
          <label className="label">Catatan <span className="text-slate-400">(opsional)</span></label>
          <textarea value={catatan} onChange={e => setCatatan(e.target.value)}
            className="input resize-none h-24" placeholder="Catatan tambahan..." />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-slate-700">Total Pembayaran</span>
            <span className="text-xl font-bold text-blue-700">
              {program.biaya === 0 ? 'Gratis' : formatRupiah(program.biaya)}
            </span>
          </div>
          <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            disabled={loading}>
            <CreditCard size={18} />
            {loading ? 'Memproses...' : 'Bayar Sekarang via Midtrans'}
          </button>
          <p className="text-xs text-slate-400 text-center mt-2">
            Pembayaran aman melalui Midtrans · VA / QRIS / e-wallet
          </p>
        </div>
      </form>
    </div>
  )
}
