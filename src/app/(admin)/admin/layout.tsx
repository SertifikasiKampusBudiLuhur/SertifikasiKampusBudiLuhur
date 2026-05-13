import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, BookOpen, Users, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  const navItems = [
    { href: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { href: '/admin/programs', icon: <BookOpen size={18} />, label: 'Program Sertifikasi' },
    { href: '/admin/registrations', icon: <Users size={18} />, label: 'Data Pendaftar' },
  ]

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-60 bg-slate-900 flex flex-col">
        <div className="flex flex-col gap-1 px-5 py-5 border-b border-slate-700">
          <Image
            src="/logo/Logo BLU Horizontal Monokrom.png"
            alt="BLU"
            width={140}
            height={48}
            className="h-14 w-auto"
            priority
          />
          <span className="text-xs text-slate-400">Admin Panel</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-semibold text-white truncate">{profile?.nama_lengkap}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit"
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg w-full transition-colors">
              <LogOut size={16} /> Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
