'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, X } from 'lucide-react'

interface Props {
  registrationId: string
  userId: string
  existingSertifikatUrl: string | null
}

export function UploadSertifikat({ registrationId, userId, existingSertifikatUrl }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [modal, setModal] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function openModal() {
    setFile(null)
    setError(null)
    setModal(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(f.type)) {
      setError('Format tidak didukung. Gunakan PDF, JPG, PNG, atau WebP.')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10 MB.')
      return
    }
    setError(null)
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${registrationId}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('sertifikat')
        .upload(path, file, { upsert: true })

      if (uploadErr) throw new Error('Gagal upload: ' + uploadErr.message)

      const { error: updateErr } = await supabase
        .from('registrations')
        .update({ sertifikat_url: path })
        .eq('id', registrationId)

      if (updateErr) throw new Error('Gagal simpan: ' + updateErr.message)

      setModal(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
          existingSertifikatUrl
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        <Upload size={13} />
        {existingSertifikatUrl ? 'Ganti' : 'Upload Sertifikat'}
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Upload Sertifikat</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-4">
              Upload sertifikat untuk peserta ini. Format: PDF, JPG, PNG. Maks 10 MB.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">
                {error}
              </div>
            )}

            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors mb-4">
                <Upload size={22} className="text-slate-400 mb-1" />
                <span className="text-sm text-slate-500">Pilih file sertifikat</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={18} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="p-1 text-slate-400 hover:text-red-500 rounded">
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setModal(false)} className="btn-secondary flex-1">
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  'Mengupload...'
                ) : (
                  <><CheckCircle size={15} /> Simpan Sertifikat</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
