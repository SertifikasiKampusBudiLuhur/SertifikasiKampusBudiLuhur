import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate, STATUS_COLOR, STATUS_LABEL } from '@/lib/utils'
import { VerifyActions } from './VerifyActions'
import { ExportButton } from './ExportButton'
import { UploadSertifikat } from './UploadSertifikat'

type FilterStatus = 'ALL' | 'PAID' | 'APPROVED' | 'REJECTED' | 'PENDING_PAYMENT'

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: { status?: FilterStatus; program?: string }
}) {
  const supabase = createClient()
  const filterStatus = searchParams.status || 'PAID'

  let query = supabase
    .from('registrations')
    .select(`
      *,
      user:profiles!user_id(id, nama_lengkap, nim, program_studi, angkatan, no_wa),
      program:certification_programs(id, nama, biaya),
      transaction:transactions(paid_at, payment_type)
    `)
    .order('updated_at', { ascending: false })

  if (filterStatus !== 'ALL') {
    query = query.eq('status', filterStatus)
  }

  const { data: registrations } = await query
  const { data: programs } = await supabase
    .from('certification_programs').select('id, nama').order('nama')

  const filterTabs: { label: string; value: FilterStatus }[] = [
    { label: 'Perlu Diverifikasi', value: 'PAID' },
    { label: 'Semua', value: 'ALL' },
    { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
    { label: 'Diterima', value: 'APPROVED' },
    { label: 'Ditolak', value: 'REJECTED' },
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Data Pendaftar</h1>
          <p className="text-slate-500 mt-1 text-sm">Verifikasi kelayakan dan kelola status peserta</p>
        </div>
        <ExportButton />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filterTabs.map(tab => (
          <a
            key={tab.value}
            href={`/admin/registrations?status=${tab.value}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Mahasiswa', 'Program', 'Jadwal', 'Bayar', 'Status', 'Sertifikat', 'Aksi'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations?.map((reg: any) => (
                <tr key={reg.id} className="hover:bg-slate-50 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{reg.user?.nama_lengkap}</p>
                    <p className="text-xs text-slate-400">{reg.user?.nim}</p>
                    <p className="text-xs text-slate-400">{reg.user?.program_studi}</p>
                    {reg.user?.no_wa && (
                      <a href={`https://wa.me/62${reg.user.no_wa.replace(/^0/, '')}`}
                        target="_blank" className="text-xs text-green-600 hover:underline">
                        WA: {reg.user.no_wa}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{reg.program?.nama}</p>
                    <p className="text-xs text-slate-400">{formatRupiah(reg.program?.biaya ?? 0)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{reg.jadwal_pilihan || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {reg.transaction?.[0]?.paid_at ? formatDate(reg.transaction[0].paid_at) : '-'}
                    {reg.transaction?.[0]?.payment_type && (
                      <p className="text-slate-400">{reg.transaction[0].payment_type}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLOR[reg.status as keyof typeof STATUS_COLOR]}`}>
                      {STATUS_LABEL[reg.status as keyof typeof STATUS_LABEL]}
                    </span>
                    {reg.status === 'REJECTED' && reg.alasan_tolak && (
                      <p className="text-xs text-red-500 mt-1 max-w-32 truncate" title={reg.alasan_tolak}>
                        {reg.alasan_tolak}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {reg.status === 'APPROVED' ? (
                      <UploadSertifikat
                        registrationId={reg.id}
                        userId={reg.user_id}
                        existingSertifikatUrl={reg.sertifikat_url ?? null}
                      />
                    ) : (
                      <span className="text-xs text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {reg.status === 'PAID' && (
                      <VerifyActions registrationId={reg.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!registrations?.length && (
            <div className="px-4 py-10 text-center text-slate-400 text-sm">
              Tidak ada data untuk filter ini.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
