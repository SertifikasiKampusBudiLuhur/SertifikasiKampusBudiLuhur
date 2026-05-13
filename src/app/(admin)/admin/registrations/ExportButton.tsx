'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'
import { formatRupiah, formatDateTime } from '@/lib/utils'

export function ExportButton() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const { data } = await supabase
      .from('registrations')
      .select(`
        *,
        user:profiles(nama_lengkap, nim, program_studi, angkatan, no_wa),
        program:certification_programs(nama, biaya, tanggal_mulai),
        transaction:transactions(paid_at, payment_type)
      `)
      .eq('status', 'APPROVED')
      .order('updated_at', { ascending: false })

    if (!data?.length) {
      alert('Tidak ada data peserta APPROVED untuk diekspor.')
      setLoading(false)
      return
    }

    const rows = data.map((reg: any) => ({
      'Nama Lengkap': reg.user?.nama_lengkap ?? '',
      'NIM': reg.user?.nim ?? '',
      'Program Studi': reg.user?.program_studi ?? '',
      'Angkatan': reg.user?.angkatan ?? '',
      'No. WhatsApp': reg.user?.no_wa ?? '',
      'Program Sertifikasi': reg.program?.nama ?? '',
      'Biaya': formatRupiah(reg.program?.biaya ?? 0),
      'Jadwal Pilihan': reg.jadwal_pilihan ?? '',
      'Tanggal Daftar': formatDateTime(reg.created_at),
      'Tanggal Bayar': reg.transaction?.[0]?.paid_at ? formatDateTime(reg.transaction[0].paid_at) : '',
      'Metode Bayar': reg.transaction?.[0]?.payment_type ?? '',
      'Tanggal Disetujui': reg.verified_at ? formatDateTime(reg.verified_at) : '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta Diterima')

    // Auto column width
    const colWidths = Object.keys(rows[0]).map(key => ({
      wch: Math.max(key.length, ...rows.map((r: any) => String(r[key]).length))
    }))
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `peserta-sertifikasi-${new Date().toISOString().split('T')[0]}.xlsx`)
    setLoading(false)
  }

  return (
    <button onClick={handleExport} disabled={loading}
      className="btn-secondary flex items-center gap-2 text-sm">
      <Download size={16} />
      {loading ? 'Mengekspor...' : 'Export Excel'}
    </button>
  )
}
