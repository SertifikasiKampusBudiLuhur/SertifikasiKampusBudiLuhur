'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function VerifyActions({ registrationId }: { registrationId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [rejectModal, setRejectModal] = useState(false)
  const [alasan, setAlasan] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('registrations').update({
      status: 'APPROVED',
      verified_by: user!.id,
      verified_at: new Date().toISOString(),
    }).eq('id', registrationId)
    setLoading(false)
    router.refresh()
  }

  async function handleReject() {
    if (!alasan.trim()) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('registrations').update({
      status: 'REJECTED',
      alasan_tolak: alasan,
      verified_by: user!.id,
      verified_at: new Date().toISOString(),
    }).eq('id', registrationId)

    setRejectModal(false)
    setAlasan('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      <div className="flex gap-2">
        <button onClick={handleApprove} disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50">
          <CheckCircle size={13} /> Terima
        </button>
        <button onClick={() => setRejectModal(true)} disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">
          <XCircle size={13} /> Tolak
        </button>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Tolak Pendaftaran</h3>
              <button onClick={() => setRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Masukkan alasan penolakan. Alasan ini akan ditampilkan ke mahasiswa.
            </p>
            <textarea
              value={alasan}
              onChange={e => setAlasan(e.target.value)}
              className="input resize-none h-24 mb-4"
              placeholder="Contoh: NIM tidak valid / Kuota program sudah penuh"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(false)} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleReject} disabled={loading || !alasan.trim()}
                className="btn-danger flex-1">
                {loading ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
