'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'PAID',            label: 'Perlu Diverifikasi' },
  { value: 'ALL',             label: 'Semua Status' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Pembayaran' },
  { value: 'APPROVED',        label: 'Diterima (APPROVED)' },
  { value: 'REJECTED',        label: 'Ditolak' },
]

interface Props {
  currentStatus: string
  currentSearch: string
}

export function RegistrationsFilter({ currentStatus, currentSearch }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)
  const [isPending, startTransition] = useTransition()

  function navigate(status: string, q: string) {
    const params = new URLSearchParams()
    params.set('status', status)
    if (q.trim()) params.set('q', q.trim())
    startTransition(() => {
      router.push(`/admin/registrations?${params.toString()}`)
    })
  }

  function clearSearch() {
    setSearch('')
    navigate(currentStatus, '')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <select
        value={currentStatus}
        onChange={e => navigate(e.target.value, search)}
        className="input w-full sm:w-60 shrink-0"
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
          onKeyDown={e => e.key === 'Enter' && navigate(currentStatus, search)}
          placeholder="Cari nama mahasiswa, NIM, atau program..."
          className="input pl-9 pr-9 w-full"
          disabled={isPending}
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <button
        onClick={() => navigate(currentStatus, search)}
        disabled={isPending}
        className="btn-primary shrink-0"
      >
        {isPending ? 'Memuat...' : 'Cari'}
      </button>
    </div>
  )
}
