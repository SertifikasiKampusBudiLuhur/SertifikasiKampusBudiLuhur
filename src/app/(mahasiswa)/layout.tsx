import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { GraduationCap, LogOut, User } from 'lucide-react'
import NavLinks from './_components/NavLinks'
import Image from 'next/image'

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
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Image
            src="/logo/Logo BLU Horizontal Colour.png"
            alt="BLU"
            width={140}
            height={46}
            className="h-10 w-auto"
            priority
          />

          {/* Nav Links */}
          <div className="flex-1 flex justify-center">
            <NavLinks />
          </div>

          {/* User Info + Logout */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href={'/profil'} className="hidden md:flex items-center gap-2.5">
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
            <div className="w-px h-6 bg-slate-200 hidden md:block" />
            <form action="/api/auth/logout" method="POST">
              <button type="submit"
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                <LogOut size={15} />
                <span className="hidden sm:inline font-medium">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
