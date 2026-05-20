import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate } from '@/lib/utils'
import { Calendar, Users, ArrowRight, Wifi, MapPin, Layers } from 'lucide-react'
import Link from 'next/link'
import { CertificationProgram } from '@/types'

const SESI_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  online:  { label: 'Online',  icon: <Wifi size={10} />,    cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  offline: { label: 'Offline', icon: <MapPin size={10} />,  cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  hybrid:  { label: 'Hybrid',  icon: <Layers size={10} />,  cls: 'text-purple-700 bg-purple-50 border-purple-200' },
}

export default async function ProgramsPage() {
  const supabase = createClient()
  const { data: programs } = await supabase
    .from('certification_programs')
    .select('*')
    .eq('is_active', true)
    .order('tanggal_mulai', { ascending: true })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Program Sertifikasi</h1>
        <p className="text-slate-500 mt-1">Pilih program sertifikasi yang sesuai dengan kebutuhanmu</p>
      </div>

      {!programs?.length ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400">Belum ada program sertifikasi yang dibuka.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {programs.map((program: CertificationProgram) => {
            const sisa = program.kuota - program.kuota_terisi
            const penuh = sisa <= 0
            const sesi = SESI_BADGE[program.tipe_sesi] ?? SESI_BADGE.offline
            return (
              <div key={program.id} className="group card overflow-hidden flex flex-col hover:shadow-md hover:border-blue-200 transition-all duration-200">
                {program.banner_url ? (
                  <div className="overflow-hidden h-44 relative">
                    <img src={program.banner_url} alt={program.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border bg-white/90 backdrop-blur-sm ${sesi.cls}`}>
                      {sesi.icon} {sesi.label}
                    </span>
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative p-4">
                    <span className="text-white font-bold text-base text-center line-clamp-3">{program.nama}</span>
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${sesi.cls}`}>
                      {sesi.icon} {sesi.label}
                    </span>
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-2 leading-snug">{program.nama}</h3>
                  {program.deskripsi && (
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">{program.deskripsi}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                      <Calendar size={10} /> {formatDate(program.tanggal_mulai)}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${
                      penuh ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    }`}>
                      <Users size={10} />
                      {penuh ? 'Kuota penuh' : `${sisa} dari ${program.kuota} kursi tersisa`}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-400">Biaya</p>
                      <span className="text-blue-700 font-bold text-base">
                        {program.biaya === 0 ? 'Gratis' : formatRupiah(program.biaya)}
                      </span>
                    </div>
                    <Link
                      href={`/programs/${program.id}`}
                      className={`flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                        penuh
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {penuh ? 'Kuota Penuh' : <>Detail <ArrowRight size={14} /></>}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
