import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Calendar, Users, MapPin, ArrowLeft, Wifi, Layers } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const SESI_STYLE: Record<string, { label: string; icon: React.ReactNode; cls: string; dot: string }> = {
  online:  { label: 'Online',  icon: <Wifi size={14} />,    cls: 'text-blue-700 bg-blue-50 border-blue-200',     dot: 'bg-blue-500' },
  offline: { label: 'Offline', icon: <MapPin size={14} />,  cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  hybrid:  { label: 'Hybrid',  icon: <Layers size={14} />,  cls: 'text-purple-700 bg-purple-50 border-purple-200',  dot: 'bg-purple-500' },
}

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: program } = await supabase
    .from('certification_programs')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!program) notFound()

  const { data: existingReg } = await supabase
    .from('registrations')
    .select('id, status')
    .eq('user_id', user!.id)
    .eq('program_id', params.id)
    .maybeSingle()

  const sisa = program.kuota - program.kuota_terisi
  const penuh = sisa <= 0
  const sesi = SESI_STYLE[program.tipe_sesi] ?? SESI_STYLE.offline

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/programs" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Kembali ke Program
      </Link>

      <div className="card overflow-hidden">
        {program.banner_url ? (
          <div className="relative h-64">
            <img src={program.banner_url} alt={program.nama} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border bg-white/95 backdrop-blur-sm ${sesi.cls}`}>
              {sesi.icon} {sesi.label}
            </span>
          </div>
        ) : (
          <div className="h-56 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center relative p-8">
            <span className="text-white font-bold text-2xl text-center">{program.nama}</span>
            <span className={`absolute top-4 left-4 inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full border ${sesi.cls}`}>
              {sesi.icon} {sesi.label}
            </span>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-5">{program.nama}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Biaya</p>
              <p className="font-bold text-blue-700">{program.biaya === 0 ? 'Gratis' : formatRupiah(program.biaya)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <Calendar size={11} /> Tanggal
              </div>
              <p className="font-semibold text-slate-700 text-sm">{formatDate(program.tanggal_mulai)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                <Users size={11} /> Kuota
              </div>
              <p className={`font-semibold text-sm ${penuh ? 'text-red-500' : 'text-slate-700'}`}>
                {penuh ? 'Penuh' : `${sisa}/${program.kuota} kursi`}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Tipe Sesi</p>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${sesi.cls}`}>
                {sesi.icon} {sesi.label}
              </span>
            </div>
          </div>

          {program.lokasi && (
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl p-3 mb-6 text-sm">
              {program.tipe_sesi === 'online' ? <Wifi size={14} className="text-blue-500 mt-0.5 flex-shrink-0" /> : <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />}
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{program.tipe_sesi === 'online' ? 'Platform / Link' : 'Lokasi'}</p>
                <p className="font-medium text-slate-700">{program.lokasi}</p>
              </div>
            </div>
          )}

          {program.deskripsi && (
            <div className="mb-6">
              <h2 className="font-semibold text-slate-700 mb-2">Deskripsi Program</h2>
              <p className="text-slate-600 text-sm leading-relaxed">{program.deskripsi}</p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-5">
            {existingReg ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
                Kamu sudah mendaftar program ini. Status: <strong>{existingReg.status}</strong>
                <Link href="/riwayat" className="ml-2 underline font-semibold">Lihat riwayat →</Link>
              </div>
            ) : penuh ? (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                Kuota program ini sudah penuh.
              </div>
            ) : (
              <Link href={`/daftar/${program.id}`}
                className="btn-primary w-full py-3.5 text-center block text-sm font-bold rounded-xl">
                Daftar Program Ini →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
