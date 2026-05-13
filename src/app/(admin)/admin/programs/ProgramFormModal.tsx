'use client'

import { useState, useRef } from 'react'
import { Plus, Pencil, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CertificationProgram, TipeSesi } from '@/types'

interface Props {
  mode: 'create' | 'edit'
  program?: CertificationProgram
}

const SESI_OPTIONS: { value: TipeSesi; label: string; color: string }[] = [
  { value: 'offline', label: 'Offline', color: 'text-green-700' },
  { value: 'online', label: 'Online', color: 'text-blue-700' },
  { value: 'hybrid', label: 'Hybrid', color: 'text-purple-700' },
]

export function ProgramFormModal({ mode, program }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: program?.nama ?? '',
    deskripsi: program?.deskripsi ?? '',
    biaya: program?.biaya?.toString() ?? '0',
    kuota: program?.kuota?.toString() ?? '30',
    tanggal_mulai: program?.tanggal_mulai ?? '',
    tanggal_selesai: program?.tanggal_selesai ?? '',
    lokasi: program?.lokasi ?? '',
    tipe_sesi: (program?.tipe_sesi ?? 'offline') as TipeSesi,
    is_active: program?.is_active ?? true,
    banner_url: program?.banner_url ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const filename = `program-${Date.now()}.${ext}`

    const { data, error: uploadErr } = await supabase.storage
      .from('banners')
      .upload(filename, file, { upsert: true, contentType: file.type })

    if (uploadErr) {
      setError(`Upload gagal: ${uploadErr.message}. Pastikan bucket "banners" sudah dibuat di Supabase Storage.`)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('banners').getPublicUrl(data.path)
    setForm(prev => ({ ...prev, banner_url: urlData.publicUrl }))
    setUploading(false)
  }

  function removeBanner() {
    setForm(prev => ({ ...prev, banner_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      nama: form.nama,
      deskripsi: form.deskripsi,
      biaya: parseInt(form.biaya),
      kuota: parseInt(form.kuota),
      tanggal_mulai: form.tanggal_mulai,
      tanggal_selesai: form.tanggal_selesai || null,
      lokasi: form.lokasi,
      tipe_sesi: form.tipe_sesi,
      is_active: form.is_active,
      banner_url: form.banner_url || null,
    }

    let err
    if (mode === 'create') {
      ;({ error: err } = await supabase.from('certification_programs').insert(payload))
    } else {
      ;({ error: err } = await supabase.from('certification_programs').update(payload).eq('id', program!.id))
    }

    if (err) { setError(err.message); setLoading(false); return }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={mode === 'create'
          ? 'btn-primary flex items-center gap-2 text-sm'
          : 'p-1.5 text-blue-400 hover:bg-blue-50 rounded transition-colors'
        }
      >
        {mode === 'create' ? <><Plus size={16} /> Tambah Program</> : <Pencil size={15} />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">
                {mode === 'create' ? 'Tambah Program Baru' : 'Edit Program'}
              </h2>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2.5 text-sm">{error}</div>
              )}

              {/* Poster/Banner Upload */}
              <div>
                <label className="label">Poster / Banner Program</label>
                {form.banner_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={form.banner_url} alt="Banner preview"
                      className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={removeBanner}
                        className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-36 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm">Mengupload...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <ImageIcon size={20} />
                        </div>
                        <span className="text-sm font-medium">Klik untuk upload poster</span>
                        <span className="text-xs">JPG, PNG, WEBP · Maks 5MB</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
                {/* URL input fallback */}
                <input
                  name="banner_url"
                  value={form.banner_url}
                  onChange={handleChange}
                  className="input mt-2 text-xs"
                  placeholder="Atau tempel URL gambar langsung..."
                />
              </div>

              <div>
                <label className="label">Nama Program <span className="text-red-500">*</span></label>
                <input name="nama" value={form.nama} onChange={handleChange} className="input" required />
              </div>

              <div>
                <label className="label">Deskripsi</label>
                <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange}
                  className="input resize-none h-20" />
              </div>

              {/* Tipe Sesi */}
              <div>
                <label className="label">Tipe Sesi <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {SESI_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                        form.tipe_sesi === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipe_sesi"
                        value={opt.value}
                        checked={form.tipe_sesi === opt.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Biaya (Rp) <span className="text-red-500">*</span></label>
                  <input type="number" name="biaya" value={form.biaya} onChange={handleChange}
                    className="input" min="0" required />
                </div>
                <div>
                  <label className="label">Kuota <span className="text-red-500">*</span></label>
                  <input type="number" name="kuota" value={form.kuota} onChange={handleChange}
                    className="input" min="1" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input type="date" name="tanggal_mulai" value={form.tanggal_mulai} onChange={handleChange}
                    className="input" required />
                </div>
                <div>
                  <label className="label">Tanggal Selesai</label>
                  <input type="date" name="tanggal_selesai" value={form.tanggal_selesai} onChange={handleChange}
                    className="input" />
                </div>
              </div>

              <div>
                <label className="label">
                  {form.tipe_sesi === 'online' ? 'Link / Platform Meeting' : 'Lokasi'}
                </label>
                <input
                  name="lokasi"
                  value={form.lokasi}
                  onChange={handleChange}
                  className="input"
                  placeholder={
                    form.tipe_sesi === 'online'
                      ? 'Zoom / Google Meet (link atau nama platform)'
                      : form.tipe_sesi === 'hybrid'
                      ? 'Gedung A / Zoom (pisahkan dengan koma)'
                      : 'Gedung A, Lab Komputer 1'
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" name="is_active" checked={form.is_active}
                  onChange={handleChange} className="w-4 h-4 rounded accent-blue-600" />
                <label htmlFor="is_active" className="text-sm text-slate-700">Program aktif (tampil ke mahasiswa)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">
                  Batal
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={loading || uploading}>
                  {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah Program' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
