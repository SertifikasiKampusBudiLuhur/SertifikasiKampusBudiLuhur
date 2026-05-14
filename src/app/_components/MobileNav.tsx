'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '#program', label: 'Program' },
  { href: '#jadwal',  label: 'Jadwal' },
  { href: '#fitur',   label: 'Fitur' },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  // Tutup menu saat scroll
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle menu"
        className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dropdown menu */}
      <div className={`
        absolute top-16 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-xl md:hidden
        transition-all duration-200 origin-top
        ${open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}
      `}>
        <div className="px-5 py-4 space-y-1">
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg text-center transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
