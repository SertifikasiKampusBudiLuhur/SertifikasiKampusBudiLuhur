'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, BookOpen, Calendar, History, User, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Beranda',   icon: <LayoutDashboard size={17} /> },
  { href: '/programs',  label: 'Program',   icon: <BookOpen size={17} /> },
  { href: '/jadwal',    label: 'Jadwal',    icon: <Calendar size={17} /> },
  { href: '/riwayat',   label: 'Riwayat',   icon: <History size={17} /> },
  { href: '/profil',    label: 'Profil',    icon: <User size={17} /> },
]

interface Props {
  nama: string
  nim: string
  initials: string
}

export default function MahasiswaMobileNav({ nama, nim, initials }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl md:hidden transform transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header — user info */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-blue-700">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm truncate">{nama}</p>
              <p className="text-xs text-slate-400 truncate">{nim}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-100">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={17} />
              Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
