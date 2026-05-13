'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, Wifi, MapPin, Layers } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'

interface CarouselProgram {
  id: string
  nama: string
  banner_url?: string | null
  tanggal_mulai: string
  tipe_sesi: string
  biaya: number
  lokasi?: string | null
}

const SESI_STYLE: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
  online:  { label: 'Online',  icon: <Wifi size={11} />,    bg: 'bg-blue-500/80' },
  offline: { label: 'Offline', icon: <MapPin size={11} />,  bg: 'bg-emerald-500/80' },
  hybrid:  { label: 'Hybrid',  icon: <Layers size={11} />,  bg: 'bg-purple-500/80' },
}

export default function ProgramCarousel({ programs }: { programs: CarouselProgram[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(p => (p + 1) % programs.length), [programs.length])
  const prev = useCallback(() => setCurrent(p => (p - 1 + programs.length) % programs.length), [programs.length])

  useEffect(() => {
    if (paused || programs.length <= 1) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [paused, next, programs.length])

  if (!programs.length) return null

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Main slide area */}
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {programs.map((p, i) => {
            const sesi = SESI_STYLE[p.tipe_sesi] ?? SESI_STYLE.offline
            return (
              <div key={p.id} className="w-full flex-shrink-0 relative h-[440px]">
                {/* Background */}
                {p.banner_url ? (
                  <img
                    src={p.banner_url}
                    alt={p.nama}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center p-12">
                    <p className="text-white text-3xl font-black text-center leading-tight opacity-20">
                      {p.nama}
                    </p>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  {/* Session badge */}
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold text-white px-2.5 py-1 rounded-full mb-3 backdrop-blur-sm ${sesi.bg}`}>
                    {sesi.icon} {sesi.label}
                  </span>
                  <h3 className="text-white text-xl md:text-2xl font-black leading-tight mb-2 line-clamp-2 drop-shadow-md">
                    {p.nama}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm mb-5">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} /> {formatDate(p.tanggal_mulai)}
                    </span>
                    <span className="font-bold text-white">
                      {p.biaya === 0 ? '🎉 Gratis' : formatRupiah(p.biaya)}
                    </span>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-lg"
                  >
                    Lihat Program
                  </Link>
                </div>

                {/* Slide counter badge */}
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {i + 1} / {programs.length}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation arrows */}
      {programs.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all shadow-lg"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {programs.length > 1 && (
        <div className="absolute bottom-5 right-7 flex items-center gap-1.5">
          {programs.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
