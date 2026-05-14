import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Calendar, Users, ArrowRight, Zap, Shield, CheckCircle, MapPin, Wifi, Layers } from 'lucide-react'
import { formatRupiah, formatDate } from '@/lib/utils'
import { CertificationProgram } from '@/types'
import ProgramCarousel from './_components/ProgramCarousel'
import FooterBL from './_components/FooterBL'
import MobileNav from './_components/MobileNav'

const SESI_BADGE: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  online:  { label: 'Online',  icon: <Wifi size={10} />,   cls: 'text-blue-700 bg-blue-50 border-blue-100' },
  offline: { label: 'Offline', icon: <MapPin size={10} />, cls: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  hybrid:  { label: 'Hybrid',  icon: <Layers size={10} />, cls: 'text-purple-700 bg-purple-50 border-purple-100' },
}

export default async function LandingPage() {
  const supabase = createClient()
  const { data: programs } = await supabase
    .from('certification_programs')
    .select('*')
    .eq('is_active', true)
    .order('tanggal_mulai', { ascending: true })
    .limit(9)

  const carouselPrograms = programs?.map(p => ({
    id: p.id,
    nama: p.nama,
    banner_url: p.banner_url,
    tanggal_mulai: p.tanggal_mulai,
    tipe_sesi: p.tipe_sesi ?? 'offline',
    biaya: p.biaya,
    lokasi: p.lokasi,
  })) ?? []

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="relative max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo/Logo BLU Horizontal Colour.png"
              alt="Universitas Budi Luhur"
              width={140}
              height={46}
              className="h-9 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <a href="#program" className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors">Program</a>
            <a href="#jadwal"  className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors">Jadwal</a>
            <a href="#fitur"   className="px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors">Fitur</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login"
              className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50">
              Masuk
            </Link>
            <Link href="/register"
              className="hidden sm:block text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Daftar Sekarang
            </Link>
            {/* Mobile hamburger */}
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-800/30 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div>
              <span className="inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-blue-500/25">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                Sistem Resmi Sertifikasi Universitas Budi Luhur
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 leading-tight tracking-tight">
                Tingkatkan<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Kompetensimu
                </span>
              </h1>
              <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed max-w-lg">
                Sebagai mahasiswa Universitas Budi Luhur, daftarkan dirimu ke program
                sertifikasi kompetensi secara online — pembayaran otomatis via QRIS,
                VA Bank, atau e-wallet, tanpa antri dan tanpa upload bukti transfer.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/40 text-sm">
                  Daftar Sekarang <ArrowRight size={16} />
                </Link>
                <a href="#program"
                  className="inline-flex items-center justify-center bg-white/8 hover:bg-white/15 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-white/15 text-sm">
                  Lihat Program
                </a>
              </div>
            </div>

            {/* Right — info card */}
            <div className="hidden md:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Alur Pendaftaran</p>
                {[
                  { step: '01', title: 'Buat Akun', desc: 'Daftar dengan NIM dan email aktif UBL' },
                  { step: '02', title: 'Pilih Program', desc: 'Pilih sertifikasi yang sesuai bidangmu' },
                  { step: '03', title: 'Bayar Otomatis', desc: 'QRIS, VA, atau e-wallet via Midtrans' },
                  { step: '04', title: 'Tunggu Verifikasi', desc: 'Admin memverifikasi kelayakanmu' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-black flex items-center justify-center flex-shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{s.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                  {[
                    { val: `${programs?.length ?? 0}+`, label: 'Program Aktif' },
                    { val: '100%',                      label: 'Bayar Otomatis' },
                    { val: '24/7',                      label: 'Status Real-time' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-xl font-black text-blue-400">{s.val}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Mobile stats */}
          <div className="md:hidden grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
            {[
              { val: `${programs?.length ?? 0}+`, label: 'Program Aktif' },
              { val: '100%',                      label: 'Bayar Otomatis' },
              { val: '24/7',                      label: 'Real-time' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-blue-400">{s.val}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Carousel ─────────────────────────────────────────────── */}
      {carouselPrograms.length > 0 && (
        <section id="carousel" className="py-14 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Program Unggulan</h2>
                <p className="text-slate-500 text-sm mt-1">Program sertifikasi yang sedang dibuka untuk mahasiswa UBL</p>
              </div>
              <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <ProgramCarousel programs={carouselPrograms} />
          </div>
        </section>
      )}

      {/* ── Program Grid ─────────────────────────────────────────── */}
      <section id="program" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-blue-600 font-semibold text-sm mb-2">Program Tersedia</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Daftar Program Sertifikasi</h2>
            <p className="text-slate-500 mt-2 text-base max-w-xl">
              Pilih program yang sesuai dengan bidang studi dan kebutuhanmu sebagai mahasiswa Universitas Budi Luhur.
            </p>
          </div>

          {!programs?.length ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-5xl mb-3 opacity-30">🎓</p>
              <p>Belum ada program yang tersedia saat ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {programs.map((program: CertificationProgram) => {
                const sisa = program.kuota - program.kuota_terisi
                const penuh = sisa <= 0
                const sesi = SESI_BADGE[program.tipe_sesi] ?? SESI_BADGE.offline
                return (
                  <div key={program.id}
                    className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-lg hover:border-blue-200 transition-all duration-200">
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
                        <Link href="/login"
                          className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors">
                          Daftar <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Jadwal ───────────────────────────────────────────────── */}
      <section id="jadwal" className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-blue-600 font-semibold text-sm mb-2">Jadwal Mendatang</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Jangan Sampai Ketinggalan</h2>
            <p className="text-slate-500 mt-2 text-base">Kuota terbatas — segera amankan tempat sebelum penuh.</p>
          </div>
          {!programs?.length ? (
            <p className="text-slate-400">Belum ada jadwal tersedia.</p>
          ) : (
            <div className="space-y-3">
              {programs.slice(0, 5).map((program: CertificationProgram) => {
                const sisa = program.kuota - program.kuota_terisi
                const penuh = sisa <= 0
                const d = new Date(program.tanggal_mulai)
                const sesi = SESI_BADGE[program.tipe_sesi] ?? SESI_BADGE.offline
                return (
                  <div key={program.id}
                    className="group flex items-center gap-5 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all">
                    <div className="flex-shrink-0 w-14 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex flex-col items-center justify-center text-white shadow-md shadow-blue-200">
                      <span className="text-[10px] font-bold leading-none tracking-wider">
                        {d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-2xl font-black leading-none mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-800 transition-colors truncate">{program.nama}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sesi.cls}`}>
                          {sesi.icon} {sesi.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Users size={10} /> {penuh ? 'Kuota penuh' : `${sisa} kursi tersisa`}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                      <span className="text-sm font-bold text-blue-700">
                        {program.biaya === 0 ? 'Gratis' : formatRupiah(program.biaya)}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        penuh ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {penuh ? 'Penuh' : 'Buka'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-8">
            <Link href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all">
              Login untuk melihat jadwal lengkap <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Fitur ────────────────────────────────────────────────── */}
      <section id="fitur" className="py-20 px-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-blue-400 font-semibold text-sm mb-2">Kenapa Pakai Sistem Ini?</p>
            <h2 className="text-3xl md:text-4xl font-bold">Sertifikasi UBL Jadi Lebih Mudah</h2>
            <p className="text-slate-400 mt-2 text-base max-w-xl">
              Dirancang khusus untuk mahasiswa Universitas Budi Luhur — proses cepat, transparan, dan terverifikasi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap size={26} />,
                color: 'bg-blue-500',
                title: 'Pembayaran Otomatis',
                desc: 'Bayar via VA Bank, QRIS, GoPay, atau ShopeePay. Konfirmasi otomatis — admin tidak perlu cek manual.',
              },
              {
                icon: <Shield size={26} />,
                color: 'bg-emerald-500',
                title: 'Verifikasi Data Mahasiswa',
                desc: 'Admin UBL memverifikasi NIM dan kelayakan peserta sebelum pendaftaran dikonfirmasi secara resmi.',
              },
              {
                icon: <CheckCircle size={26} />,
                color: 'bg-purple-500',
                title: 'Pantau Status Real-time',
                desc: 'Lacak setiap tahap — dari pembayaran hingga persetujuan akhir — langsung dari dashboard mahasiswamu.',
              },
            ].map(f => (
              <div key={f.title} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-7 transition-colors">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center bg-white/5 border border-white/10 rounded-2xl p-10">
            <h3 className="text-2xl font-bold text-white mb-3">Mahasiswa UBL? Daftar Sekarang.</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Buat akun dengan NIM-mu dan mulai daftar program sertifikasi yang tersedia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register"
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition-colors text-sm shadow-lg shadow-blue-900/30">
                Buat Akun Gratis
              </Link>
              <Link href="/login"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl transition-colors border border-white/15 text-sm">
                Sudah Punya Akun
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterBL />
    </div>
  )
}
