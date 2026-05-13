'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Beranda' },
  { href: '/programs', label: 'Program' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/riwayat', label: 'Riwayat' },
]

export default function NavLinks() {
  const pathname = usePathname()
  return (
    <div className="flex items-center gap-1">
      {navItems.map(item => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              active
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
