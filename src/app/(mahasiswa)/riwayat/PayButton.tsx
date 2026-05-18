'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreditCard } from 'lucide-react'

declare global {
  interface Window { snap: any }
}

interface Props {
  registrationId: string
  existingSnapToken?: string | null
}

export default function PayButton({ registrationId, existingSnapToken }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!)
    document.head.appendChild(script)
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script)
    }
  }, [])

  async function handlePay() {
    setLoading(true)
    setError('')

    try {
      let snapToken = existingSnapToken

      if (!snapToken) {
        const res = await fetch('/api/midtrans/create-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration_id: registrationId }),
        })
        const data = await res.json()
        if (data.error || !data.snap_token) {
          setError('Gagal memuat pembayaran. Coba lagi.')
          setLoading(false)
          return
        }
        snapToken = data.snap_token
      }

      window.snap.pay(snapToken, {
        onSuccess: () => router.push('/riwayat?payment=success'),
        onPending: () => router.push('/riwayat?payment=pending'),
        onError: () => { setError('Pembayaran gagal. Coba lagi.'); setLoading(false) },
        onClose: () => setLoading(false),
      })
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <CreditCard size={15} />
        {loading ? 'Memuat...' : 'Bayar Sekarang'}
      </button>
    </div>
  )
}
