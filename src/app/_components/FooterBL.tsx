import Image from 'next/image'
import Link from 'next/link'
import { Mail, Facebook, Instagram, Youtube, Linkedin, MapPin, Phone } from 'lucide-react'

export default function FooterBL() {
  const year = new Date().getFullYear()
  return (
    <footer>
      {/* Main footer — dark navy */}
      <div className="bg-blue-800 text-white px-6 pt-12 pb-10">
        <div className="max-w-7xl mx-auto">

          {/* Logos row */}
          <div className="flex flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-8 border-b border-white/10">
            <Image
              src="/logo/Logo BL Horisontal-Grs Putih_tls cerdas putih.png"
              alt="Universitas Budi Luhur"
              width={220}
              height={64}
              className="h-16 w-auto"
            />
            <Image
              src="/logo/logo 47 HD-Rev-White.png"
              alt="47 Tahun Universitas Budi Luhur"
              width={90}
              height={90}
              className="h-16 w-auto"
            />
          </div>

          {/* Social icons */}
          <div className="flex gap-2.5 mb-10">
            {[
              { icon: <Mail size={15} />,      href: 'mailto:info@budiluhur.ac.id',           label: 'Email' },
              { icon: <Facebook size={15} />,  href: 'https://facebook.com/budiluhurofficial', label: 'Facebook' },
              { icon: <Instagram size={15} />, href: 'https://instagram.com/univ.budiluhur',   label: 'Instagram' },
              { icon: <Youtube size={15} />,   href: 'https://youtube.com/@BudiLuhurTV',       label: 'YouTube' },
              { icon: <Linkedin size={15} />,  href: 'https://linkedin.com/school/universitas-budi-luhur', label: 'LinkedIn' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 border border-white/25 rounded flex items-center justify-center text-slate-300 hover:bg-white/10 hover:text-white transition-colors">
                {s.icon}
              </a>
            ))}
          </div>

          {/* Three-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-4 tracking-wide text-xs uppercase">Quick Links</h4>
              <ul className="space-y-2.5 text-slate-300">
                {[
                  { href: '/#program',          label: 'Program Sertifikasi' },
                  { href: '/#jadwal',           label: 'Jadwal Sertifikasi' },
                  { href: '/register',          label: 'Cara Daftar' },
                  { href: 'https://budiluhur.ac.id', label: 'Website UBL', external: true },
                ].map(l => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noopener noreferrer"
                        className="hover:text-white transition-colors">{l.label}</a>
                    ) : (
                      <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Informasi */}
            <div>
              <h4 className="font-bold text-white mb-4 tracking-wide text-xs uppercase">Informasi</h4>
              <ul className="space-y-2.5 text-slate-300">
                {[
                  { href: '/login',        label: 'Login Mahasiswa' },
                  { href: '/register',     label: 'Daftar Akun' },
                  { href: '/riwayat',      label: 'Riwayat Pendaftaran' },
                  { href: '/admin/login',  label: 'Login Admin' },
                ].map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lokasi */}
            <div>
              <h4 className="font-bold text-white mb-4 tracking-wide text-xs uppercase">Lokasi</h4>
              <div className="space-y-3 text-slate-300">
                <div className="flex gap-2.5">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                  <p className="leading-relaxed">
                    Jl. Ciledug Raya, RT 10/RW 2,<br />
                    Petukangan Utara, Pesanggrahan,<br />
                    Jakarta Selatan 12260
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <Phone size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                  <p>(021) 5853753</p>
                </div>
                <div className="flex gap-2.5">
                  <Mail size={14} className="mt-0.5 flex-shrink-0 text-slate-400" />
                  <a href="mailto:info@budiluhur.ac.id"
                    className="hover:text-white transition-colors">info@budiluhur.ac.id</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yellow copyright bar */}
      <div className="bg-accent-400 py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-xs font-medium text-slate-800">
          <span>Hak Cipta © {year} Universitas Budi Luhur. All Rights Reserved.</span>
          <span>Sistem Registrasi Sertifikasi Kampus</span>
        </div>
      </div>
    </footer>
  )
}
