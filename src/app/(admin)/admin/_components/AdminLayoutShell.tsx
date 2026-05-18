'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LayoutDashboard, BookOpen, Users, LogOut, Menu, X } from 'lucide-react'

interface Props {
  nama: string
  children: React.ReactNode
}

const navItems = [
  { href: '/admin/dashboard',     icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/admin/programs',      icon: <BookOpen size={18} />,        label: 'Program Sertifikasi' },
  { href: '/admin/registrations', icon: <Users size={18} />,           label: 'Data Pendaftar' },
]

export default function AdminLayoutShell({ nama, children }: Props) {
  const [open, setOpen] = useState(false)

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={
      mobile
        ? 'flex flex-col h-full bg-slate-900 w-64'
        : 'hidden md:flex flex-col w-60 bg-slate-900 h-screen sticky top-0'
    }>
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
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-white truncate">{nama}</p>
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
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={`fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar mobile />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-slate-900 border-b border-slate-700">
          <button
            onClick={() => setOpen(v => !v)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Image
            src="/logo/Logo BLU Horizontal Monokrom.png"
            alt="BLU"
            width={100}
            height={36}
            className="h-8 w-auto"
          />
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
