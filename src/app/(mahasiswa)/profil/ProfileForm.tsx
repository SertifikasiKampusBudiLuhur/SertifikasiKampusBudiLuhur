'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, CheckCircle, Camera, User } from 'lucide-react'
import { Profile } from '@/types'

interface Props {
  profile: Profile
  ktmSignedUrl: string | null
}

export default function ProfileForm({ profile, ktmSignedUrl }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nama_lengkap: profile.nama_lengkap,
    program_studi: profile.program_studi,
    angkatan: profile.angkatan,
    no_wa: profile.no_wa ?? '',
  })
  const [ktmFile, setKtmFile] = useState<File | null>(null)
  const [ktmPreview, setKtmPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran foto profil maksimal 2 MB.')
      return
    }

    setError(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5 MB.')
      return
    }

    setError(null)
    setKtmFile(file)
    if (file.type.startsWith('image/')) {
      setKtmPreview(URL.createObjectURL(file))
    } else {
      setKtmPreview(null)
    }
  }

  function removeFile() {
    setKtmFile(null)
    setKtmPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let ktm_url = profile.ktm_url
      let avatar_url = profile.avatar_url

      // Upload foto profil
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${profile.id}/avatar.${ext}`
        const { error: avatarErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })

        if (avatarErr) throw new Error('Gagal upload foto profil: ' + avatarErr.message)

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        // cache-bust agar foto baru langsung tampil
        avatar_url = `${urlData.publicUrl}?t=${Date.now()}`
      }

      // Upload KTM
      if (ktmFile) {
        const ext = ktmFile.name.split('.').pop()
        const path = `${profile.id}/ktm.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('ktm')
          .upload(path, ktmFile, { upsert: true })

        if (uploadError) throw new Error('Gagal upload KTM: ' + uploadError.message)
        ktm_url = path
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nama_lengkap: form.nama_lengkap.trim(),
          program_studi: form.program_studi.trim(),
          angkatan: form.angkatan.trim(),
          no_wa: form.no_wa.trim() || null,
          ...(ktm_url !== profile.ktm_url ? { ktm_url } : {}),
          ...(avatar_url !== profile.avatar_url ? { avatar_url } : {}),
        })
        .eq('id', profile.id)

      if (updateError) throw new Error('Gagal update profil: ' + updateError.message)

      setSuccess(true)
      setKtmFile(null)
      setAvatarFile(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentAvatar = avatarPreview ?? profile.avatar_url ?? null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle size={16} /> Profil berhasil diperbarui.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Foto Profil */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-1">Foto Profil</h2>
        <p className="text-sm text-slate-500 mb-4">
          Upload foto profil kamu. Format: JPG, PNG, atau WebP. Maks 2 MB.
        </p>

        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-50 border-2 border-slate-200 flex items-center justify-center">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Foto profil" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-blue-300" />
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
              title="Ganti foto"
            >
              <Camera size={15} />
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              {currentAvatar ? 'Ganti Foto' : 'Pilih Foto'}
            </button>
            {avatarFile && (
              <p className="text-xs text-emerald-600 font-medium mt-2">
                Foto baru dipilih — klik &quot;Simpan Perubahan&quot; untuk menyimpan.
              </p>
            )}
          </div>

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Data diri */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Data Diri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NIM</label>
            <input value={profile.nim} disabled
              className="input bg-slate-50 text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input
              value={form.nama_lengkap}
              onChange={e => setForm(f => ({ ...f, nama_lengkap: e.target.value }))}
              required className="input"
              placeholder="Nama lengkap sesuai KTM"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Program Studi</label>
            <input
              value={form.program_studi}
              onChange={e => setForm(f => ({ ...f, program_studi: e.target.value }))}
              required className="input"
              placeholder="Contoh: Teknik Informatika"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Angkatan</label>
            <input
              value={form.angkatan}
              onChange={e => setForm(f => ({ ...f, angkatan: e.target.value }))}
              required className="input"
              placeholder="Contoh: 2022"
              maxLength={4}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              No. WhatsApp
            </label>
            <input
              value={form.no_wa}
              onChange={e => setForm(f => ({ ...f, no_wa: e.target.value }))}
              className="input"
              placeholder="Contoh: 08123456789"
            />
          </div>
        </div>
      </div>

      {/* Upload KTM */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-1">Kartu Tanda Mahasiswa (KTM)</h2>
        <p className="text-sm text-slate-500 mb-4">
          Upload foto atau scan KTM kamu. Format: JPG, PNG, WebP, atau PDF. Maks 5 MB.
        </p>

        {/* Preview KTM yang sudah ada */}
        {ktmSignedUrl && !ktmFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <FileText size={20} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800">KTM sudah diupload</p>
              <a href={ktmSignedUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline truncate block">
                Lihat KTM saat ini
              </a>
            </div>
          </div>
        )}

        {/* Drop zone */}
        {!ktmFile ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Upload size={24} className="text-slate-400 mb-2" />
            <span className="text-sm text-slate-500">
              {ktmSignedUrl ? 'Ganti KTM' : 'Upload KTM'}
            </span>
            <span className="text-xs text-slate-400 mt-1">Klik untuk pilih file</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="border border-slate-200 rounded-lg p-3 flex items-center gap-3">
            {ktmPreview ? (
              <img src={ktmPreview} alt="Preview KTM"
                className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{ktmFile.name}</p>
              <p className="text-xs text-slate-400">
                {(ktmFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button type="button" onClick={removeFile}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading}
          className="btn-primary min-w-32">
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </form>
  )
}
