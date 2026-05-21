'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { formatRupiah, formatDateTime, STATUS_LABEL } from '@/lib/utils'

interface Props {
  registrations: any[]
  filterLabel: string
}

export function ExportButton({ registrations, filterLabel }: Props) {
  const [loading, setLoading] = useState(false)

  function handleExport() {
    if (!registrations.length) {
      alert('Tidak ada data untuk diekspor dengan filter saat ini.')
      return
    }
    setLoading(true)

    const rows = registrations.map((reg: any) => ({
      'Nama Lengkap': reg.user?.nama_lengkap ?? '',
      'NIM': reg.user?.nim ?? '',
      'Program Studi': reg.user?.program_studi ?? '',
      'Angkatan': reg.user?.angkatan ?? '',
      'No. WhatsApp': reg.user?.no_wa ?? '',
      'Program Sertifikasi': reg.program?.nama ?? '',
      'Biaya': formatRupiah(reg.program?.biaya ?? 0),
      'Sesi Dipilih': reg.jadwal_pilihan ?? '',
      'Status': STATUS_LABEL[reg.status as keyof typeof STATUS_LABEL] ?? reg.status,
      'Tanggal Daftar': formatDateTime(reg.created_at),
      'Tanggal Bayar': reg.transaction?.[0]?.paid_at ? formatDateTime(reg.transaction[0].paid_at) : '',
      'Metode Bayar': reg.transaction?.[0]?.payment_type ?? '',
      'Tanggal Diverifikasi': reg.verified_at ? formatDateTime(reg.verified_at) : '',
      'Alasan Ditolak': reg.alasan_tolak ?? '',
      'Sertifikat': reg.sertifikat_url ? 'Sudah diupload' : '-',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pendaftar')

    // Auto column width
    ws['!cols'] = Object.keys(rows[0]).map(key => ({
      wch: Math.max(key.length, ...rows.map((r: any) => String(r[key as keyof typeof r]).length)) + 2,
    }))

    const today = new Date().toISOString().split('T')[0]
    XLSX.writeFile(wb, `pendaftar-${filterLabel}-${today}.xlsx`)
    setLoading(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn-secondary flex items-center gap-2 text-sm"
    >
      <Download size={16} />
      {loading ? 'Mengekspor...' : `Export Excel (${registrations.length})`}
    </button>
  )
}
