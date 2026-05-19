import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import NavLinks from './_components/NavLinks'
import MahasiswaMobileNav from './_components/MahasiswaMobileNav'
import Image from 'next/image'
import FooterApp from '@/app/_components/FooterApp'

export default async function MahasiswaLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role === 'admin') redirect('/admin/dashboard')

  const initials = profile?.nama_lengkap
    ?.split(' ')
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() ?? 'MHS'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex-shrink-0">
            <Image
              src="/logo/Logo BLU Horizontal Colour.png"
              alt="BLU"
              width={140}
              height={46}
              className="h-9 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex flex-1 justify-center">
            <NavLinks />
          </div>

          {/* Desktop: User Info + Logout */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Link href="/profil" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">{initials}</span>
              </div>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
                  {profile?.nama_lengkap}
                </p>
                <p className="text-xs text-slate-400">{profile?.nim}</p>
              </div>
            </Link>
            <div className="w-px h-6 bg-slate-200" />
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut size={15} />
                <span className="font-medium">Keluar</span>
              </button>
            </form>
          </div>

          {/* Mobile: Hamburger drawer */}
          <MahasiswaMobileNav
            nama={profile?.nama_lengkap ?? 'Mahasiswa'}
            nim={profile?.nim ?? ''}
            initials={initials}
          />
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {children}
      </main>

      <FooterApp />
    </div>
  )
}
