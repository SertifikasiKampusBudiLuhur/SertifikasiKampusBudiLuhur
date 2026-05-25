'use client'

import { useState } from 'react'
import { IdCard, X, Loader2, AlertCircle } from 'lucide-react'

interface Props {
  registrationId: string
  nama: string
  ktmPath: string // raw path stored in profiles.ktm_url
}

export function KtmPreview({ registrationId, nama, ktmPath }: Props) {
  const [open, setOpen] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  async function handleOpen() {
    setOpen(true)
    if (signedUrl) return // already fetched, reuse

    setLoading(true)
    setError(false)
    try {
      const res = await fetch(
        `/api/admin/ktm-signed-url?path=${encodeURIComponent(ktmPath)}`
      )
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setSignedUrl(json.url)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
  }

  const isPdf = ktmPath.toLowerCase().split('?')[0].endsWith('.pdf')

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline mt-0.5"
        title="Lihat KTM"
      >
        <IdCard size={12} />
        Lihat KTM
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IdCard size={15} className="text-indigo-500" />
                <h3 className="font-semibold text-slate-800 text-sm truncate pr-2">
                  KTM — {nama}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto bg-slate-100 p-3 min-h-[200px] flex items-center justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-xs">Memuat KTM…</span>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center gap-2 text-red-400">
                  <AlertCircle size={24} />
                  <span className="text-xs text-center">
                    Gagal memuat KTM. Coba lagi nanti.
                  </span>
                </div>
              )}

              {signedUrl && !loading && (
                isPdf ? (
                  <iframe
                    src={signedUrl}
                    className="w-full h-[65vh] rounded bg-white"
                    title={`KTM ${nama}`}
                  />
                ) : (
                  <img
                    src={signedUrl}
                    alt={`KTM ${nama}`}
                    className="w-full h-auto rounded max-h-[65vh] object-contain"
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
