'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, X, CalendarDays, RotateCcw } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'PAID',            label: 'Perlu Diverifikasi' },
  { value: 'ALL',             label: 'Semua Status' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'APPROVED',        label: 'Diterima (APPROVED)' },
  { value: 'REJECTED',        label: 'Ditolak' },
]

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

interface Props {
  currentStatus: string
  currentSearch: string
  currentDay: string
  currentMonth: string
  currentYear: string
}

export function RegistrationsFilter({
  currentStatus, currentSearch, currentDay, currentMonth, currentYear,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  const thisYear = new Date().getFullYear()
  const years = [thisYear + 1, thisYear, thisYear - 1, thisYear - 2]

  function navigate(next: Partial<{ status: string; q: string; day: string; month: string; year: string }>) {
    const sp = new URLSearchParams()
    sp.set('status', next.status ?? currentStatus)
    const q = next.q ?? search
    if (q.trim()) sp.set('q', q.trim())
    const day = next.day ?? currentDay
    const month = next.month ?? currentMonth
    const year = next.year ?? currentYear
    if (day) sp.set('day', day)
    if (month) sp.set('month', month)
    if (year) sp.set('year', year)
    startTransition(() => router.push(`/admin/registrations?${sp.toString()}`))
  }

  const hasDateFilter = !!(currentDay || currentMonth || currentYear)

  return (
    <div className="space-y-3 mb-6">
      {/* Row 1: status + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={currentStatus}
          onChange={e => navigate({ status: e.target.value })}
          className="input w-full sm:w-56 shrink-0"
          disabled={isPending}
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate({ q: search })}
            placeholder="Cari nama mahasiswa, NIM, atau program..."
            className="input pl-9 pr-9 w-full"
            disabled={isPending}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); navigate({ q: '' }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          onClick={() => navigate({ q: search })}
          disabled={isPending}
          className="btn-primary shrink-0"
        >
          {isPending ? 'Memuat...' : 'Cari'}
        </button>
      </div>

      {/* Row 2: date filter (Day / Month / Year) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <CalendarDays size={14} className="text-blue-500" /> Tanggal daftar:
        </span>
        <select
          value={currentDay}
          onChange={e => navigate({ day: e.target.value })}
          className="input w-auto text-sm py-1.5"
          disabled={isPending}
        >
          <option value="">Semua Tgl</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={currentMonth}
          onChange={e => navigate({ month: e.target.value })}
          className="input w-auto text-sm py-1.5"
          disabled={isPending}
        >
          <option value="">Semua Bulan</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={e => navigate({ year: e.target.value })}
          className="input w-auto text-sm py-1.5"
          disabled={isPending}
        >
          <option value="">Semua Tahun</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {hasDateFilter && (
          <button
            onClick={() => navigate({ day: '', month: '', year: '' })}
            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1.5"
          >
            <RotateCcw size={12} /> Reset tanggal
          </button>
        )}
      </div>
    </div>
  )
}
