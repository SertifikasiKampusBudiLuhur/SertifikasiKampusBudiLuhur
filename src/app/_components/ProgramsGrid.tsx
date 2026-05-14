'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Users, ArrowRight, X, MapPin, Wifi, Layers, Clock } from 'lucide-react'
import { CertificationProgram } from '@/types'
import { formatRupiah, formatDate } from '@/lib/utils'

const SESI_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string; clsDark: string }> = {
  online:  { label: 'Online',  icon: <Wifi size={12} />,   cls: 'text-blue-700 bg-blue-50 border-blue-100',     clsDark: 'text-blue-300 bg-blue-500/15 border-blue-500/25' },
  offline: { label: 'Offline', icon: <MapPin size={12} />, cls: 'text-emerald-700 bg-emerald-50 border-emerald-100', clsDark: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/25' },
  hybrid:  { label: 'Hybrid',  icon: <Layers size={12} />, cls: 'text-purple-700 bg-purple-50 border-purple-100',  clsDark: 'text-purple-300 bg-purple-500/15 border-purple-500/25' },
}

export default function ProgramsGrid({ programs }: { programs: CertificationProgram[] }) {
  const [selected, setSelected] = useState<CertificationProgram | null>(null)

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {programs.map(program => {
          const sisa = program.kuota - program.kuota_terisi
          const penuh = sisa <= 0
          const sesi = SESI_BADGE[program.tipe_sesi] ?? SESI_BADGE.offline
          return (
            <div
              key={program.id}
              onClick={() => setSelected(program)}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer"
            >
              {program.banner_url ? (
                <div className="overflow-hidden h-48 relative">
                  <img src={program.banner_url} alt={program.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${sesi.cls}`}>
                    {sesi.icon} {sesi.label}
                  </span>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-6 relative">
                  <span className="text-white font-bold text-base text-center leading-snug">{program.nama}</span>
                  <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${sesi.cls}`}>
                    {sesi.icon} {sesi.label}
                  </span>
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 leading-snug">{program.nama}</h3>
                {program.deskripsi && (
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2 leading-relaxed">{program.deskripsi}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full font-medium">
                    <Calendar size={10} /> {formatDate(program.tanggal_mulai)}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${
                    penuh ? 'text-red-600 bg-red-50 border-red-100' : 'text-emerald-700 bg-emerald-50 border-emerald-100'
                  }`}>
                    <Users size={10} /> {penuh ? 'Kuota Penuh' : `${sisa} kursi tersisa`}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400">Biaya pendaftaran</p>
                    <p className="text-blue-700 font-bold text-base">
                      {program.biaya === 0 ? 'GRATIS' : formatRupiah(program.biaya)}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(program) }}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Detail <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Banner / Header */}
            {selected.banner_url ? (
              <div className="relative h-52 overflow-hidden rounded-t-2xl">
                <img src={selected.banner_url} alt={selected.nama}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative h-40 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-t-2xl flex items-center justify-center px-8">
                <p className="text-white font-bold text-lg text-center leading-snug">{selected.nama}</p>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Sesi badge */}
              {(() => {
                const sesi = SESI_BADGE[selected.tipe_sesi] ?? SESI_BADGE.offline
                return (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border mb-3 ${sesi.cls}`}>
                    {sesi.icon} {sesi.label}
                  </span>
                )
              })()}

              <h2 className="text-xl font-extrabold text-slate-900 mb-3 leading-snug">{selected.nama}</h2>

              {selected.deskripsi && (
                <p className="text-slate-600 text-sm leading-relaxed mb-5">{selected.deskripsi}</p>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                    <Calendar size={11} /> Tanggal Mulai
                  </p>
                  <p className="text-sm font-semibold text-slate-800">{formatDate(selected.tanggal_mulai)}</p>
                </div>
                {selected.tanggal_selesai && (
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                      <Clock size={11} /> Tanggal Selesai
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{formatDate(selected.tanggal_selesai)}</p>
                  </div>
                )}
                {selected.lokasi && (
                  <div className="bg-slate-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                      <MapPin size={11} /> Lokasi
                    </p>
                    <p className="text-sm font-semibold text-slate-800">{selected.lokasi}</p>
                  </div>
                )}
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 mb-0.5 flex items-center gap-1">
                    <Users size={11} /> Sisa Kuota
                  </p>
                  {(() => {
                    const sisa = selected.kuota - selected.kuota_terisi
                    const penuh = sisa <= 0
                    return (
                      <p className={`text-sm font-semibold ${penuh ? 'text-red-600' : 'text-emerald-700'}`}>
                        {penuh ? 'Kuota Penuh' : `${sisa} dari ${selected.kuota} kursi`}
                      </p>
                    )
                  })()}
                </div>
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Biaya pendaftaran</p>
                  <p className="text-2xl font-extrabold text-blue-700">
                    {selected.biaya === 0 ? 'GRATIS' : formatRupiah(selected.biaya)}
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-md shadow-blue-200"
                >
                  Daftar Sekarang <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
