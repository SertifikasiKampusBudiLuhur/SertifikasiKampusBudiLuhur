import { createClient } from '@/lib/supabase/server'
import { formatRupiah } from '@/lib/utils'
import { Calendar, MapPin, Users, ArrowRight, Wifi, Layers } from 'lucide-react'
import Link from 'next/link'
import { CertificationProgram } from '@/types'

const SESI_STYLE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  online:  { label: 'Online',  icon: <Wifi size={10} />,    cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  offline: { label: 'Offline', icon: <MapPin size={10} />,  cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  hybrid:  { label: 'Hybrid',  icon: <Layers size={10} />,  cls: 'text-purple-700 bg-purple-50 border-purple-200' },
}

export default async function JadwalPage() {
  const supabase = createClient()
  const { data: programs } = await supabase
    .from('certification_programs')
    .select('*')
    .eq('is_active', true)
    .order('tanggal_mulai', { ascending: true })

  // Group by month
  const grouped: Record<string, CertificationProgram[]> = {}
  programs?.forEach((p: CertificationProgram) => {
    const key = new Date(p.tanggal_mulai).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    })
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  })

  const now = new Date()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Jadwal Sertifikasi</h1>
        <p className="text-slate-500 mt-1">Semua program sertifikasi yang akan datang</p>
      </div>

      {!programs?.length ? (
        <div className="card p-16 text-center">
          <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
          <p className="text-slate-400 font-medium">Belum ada jadwal program sertifikasi</p>
          <p className="text-slate-400 text-sm mt-1">Cek kembali nanti untuk program terbaru</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              {/* Month header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">{month}</span>
                </div>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">{items.length} program</span>
              </div>

              {/* Program items */}
              <div className="space-y-3">
                {items.map((program: CertificationProgram) => {
                  const sisa = program.kuota - program.kuota_terisi
                  const penuh = sisa <= 0
                  const d = new Date(program.tanggal_mulai)
                  const isPast = d < now
                  const sesi = SESI_STYLE[program.tipe_sesi] ?? SESI_STYLE.offline

                  return (
                    <div
                      key={program.id}
                      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        isPast
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50'
                      }`}
                    >
                      {/* Date box */}
                      <div className={`flex-shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center text-white shadow-md ${
                        isPast ? 'bg-slate-400' : 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-200'
                      }`}>
                        <span className="text-[10px] font-bold leading-none tracking-wider">
                          {d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-2xl font-black leading-none mt-0.5">{d.getDate()}</span>
                      </div>

                      {/* Poster thumbnail (if available) */}
                      {program.banner_url && !isPast && (
                        <div className="hidden sm:block flex-shrink-0 w-12 h-14 rounded-lg overflow-hidden border border-slate-200">
                          <img src={program.banner_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-800 transition-colors line-clamp-1 mb-1.5">
                          {program.nama}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sesi.cls}`}>
                            {sesi.icon} {sesi.label}
                          </span>
                          {program.lokasi && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={10} /> {program.lokasi}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 text-xs font-medium ${
                            penuh ? 'text-red-500' : 'text-emerald-600'
                          }`}>
                            <Users size={10} />
                            {penuh ? 'Kuota penuh' : `${sisa} kursi tersisa`}
                          </span>
                        </div>
                      </div>

                      {/* Price + Action */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <span className="text-sm font-bold text-blue-700">
                          {program.biaya === 0 ? 'Gratis' : formatRupiah(program.biaya)}
                        </span>
                        {!isPast && (
                          <Link
                            href={penuh ? '#' : `/programs/${program.id}`}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              penuh
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {penuh ? 'Penuh' : <>Detail <ArrowRight size={11} /></>}
                          </Link>
                        )}
                        {isPast && (
                          <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">Selesai</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
