import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate, formatDateTime, STATUS_COLOR, STATUS_LABEL } from '@/lib/utils'
import { VerifyActions } from './VerifyActions'
import { ExportButton } from './ExportButton'
import { UploadSertifikat } from './UploadSertifikat'
import { SertifikatPreview } from './SertifikatPreview'
import { RegistrationsFilter } from './RegistrationsFilter'
import { Info, Lock, Award, Clock } from 'lucide-react'

type FilterStatus = 'ALL' | 'PAID' | 'APPROVED' | 'REJECTED' | 'PENDING_PAYMENT'

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'mei', 'jun',
  'jul', 'agu', 'sep', 'okt', 'nov', 'des',
]

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: {
    status?: FilterStatus
    q?: string
    day?: string
    month?: string
    year?: string
  }
}) {
  const supabase = createClient()
  const filterStatus = searchParams.status || 'ALL'
  const searchQuery = searchParams.q?.toLowerCase().trim() || ''
  const filterDay = searchParams.day || ''
  const filterMonth = searchParams.month || ''
  const filterYear = searchParams.year || ''

  let query = supabase
    .from('registrations')
    .select(`
      *,
      user:profiles!user_id(id, nama_lengkap, nim, program_studi, angkatan, no_wa),
      program:certification_programs(id, nama, biaya),
      transaction:transactions(paid_at, payment_type)
    `)
    .order('created_at', { ascending: false })

  if (filterStatus !== 'ALL') {
    query = query.eq('status', filterStatus)
  }

  const { data: allRegistrations } = await query

  // Search filter (JS-side after fetch)
  let registrations = allRegistrations ?? []
  if (searchQuery) {
    registrations = registrations.filter((reg: any) =>
      reg.user?.nama_lengkap?.toLowerCase().includes(searchQuery) ||
      reg.user?.nim?.toLowerCase().includes(searchQuery) ||
      reg.program?.nama?.toLowerCase().includes(searchQuery)
    )
  }

  // Date filter (Day / Month / Year) on tanggal daftar
  if (filterDay || filterMonth || filterYear) {
    registrations = registrations.filter((reg: any) => {
      const d = new Date(reg.created_at)
      if (filterYear && d.getFullYear() !== Number(filterYear)) return false
      if (filterMonth && d.getMonth() + 1 !== Number(filterMonth)) return false
      if (filterDay && d.getDate() !== Number(filterDay)) return false
      return true
    })
  }

  // Signed URLs for uploaded sertifikat (preview di tabel)
  const sertifikatUrls: Record<string, string> = {}
  await Promise.all(
    registrations
      .filter((r: any) => r.sertifikat_url)
      .map(async (r: any) => {
        const { data } = await supabase.storage
          .from('sertifikat')
          .createSignedUrl(r.sertifikat_url, 60 * 60)
        if (data?.signedUrl) sertifikatUrls[r.id] = data.signedUrl
      })
  )

  // Label untuk nama file export — mengikuti filter aktif
  const exportLabel = [
    filterStatus.toLowerCase(),
    filterDay,
    filterMonth ? MONTHS[Number(filterMonth) - 1] : '',
    filterYear,
  ].filter(Boolean).join('-')

  const hasFilter = !!(searchQuery || filterDay || filterMonth || filterYear)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Data Pendaftar</h1>
          <p className="text-slate-500 mt-1 text-sm">Verifikasi kelayakan dan kelola status peserta</p>
        </div>
        <ExportButton registrations={registrations} filterLabel={exportLabel || 'semua'} />
      </div>

      {/* Workflow info — certificate upload */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800 leading-relaxed">
          <strong>Alur verifikasi &amp; sertifikat:</strong>
          <ol className="mt-1 space-y-0.5 list-decimal list-inside text-blue-700">
            <li>Mahasiswa bayar → status jadi <strong>PAID</strong> → muncul tombol <em>Terima / Tolak</em> di kolom Aksi</li>
            <li>Klik <strong>Terima</strong> → status berubah jadi <strong>APPROVED</strong></li>
            <li>Setelah APPROVED → tombol <Award size={12} className="inline mb-0.5" /> <strong>Upload Sertifikat</strong> muncul di kolom Sertifikat</li>
          </ol>
        </div>
      </div>

      {/* Filter: status + search + tanggal */}
      <RegistrationsFilter
        currentStatus={filterStatus}
        currentSearch={searchParams.q || ''}
        currentDay={filterDay}
        currentMonth={filterMonth}
        currentYear={filterYear}
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1080px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">Mahasiswa</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">Program</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">Sesi Dipilih</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">Tgl &amp; Jam Daftar</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">Bayar</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">Status</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">
                  <span className="flex items-center gap-1.5">
                    Sertifikat
                    <span className="text-[10px] font-normal text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                      setelah APPROVED
                    </span>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">
                  <span className="flex items-center gap-1.5">
                    Aksi
                    <span className="text-[10px] font-normal text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
                      saat PAID
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registrations.map((reg: any) => (
                <tr
                  key={reg.id}
                  className={`hover:bg-slate-50 align-top ${
                    reg.status === 'PAID' ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{reg.user?.nama_lengkap}</p>
                    <p className="text-xs text-slate-400">{reg.user?.nim}</p>
                    <p className="text-xs text-slate-400">{reg.user?.program_studi}</p>
                    {reg.user?.no_wa && (
                      <a
                        href={`https://wa.me/62${reg.user.no_wa.replace(/^0/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:underline"
                      >
                        WA: {reg.user.no_wa}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">{reg.program?.nama}</p>
                    <p className="text-xs text-slate-400">{formatRupiah(reg.program?.biaya ?? 0)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {reg.jadwal_pilihan ? (
                      <span className="inline-block text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                        {reg.jadwal_pilihan}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-slate-600">
                      <Clock size={11} className="text-slate-400 flex-shrink-0" />
                      {formatDateTime(reg.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {reg.transaction?.[0]?.paid_at ? formatDate(reg.transaction[0].paid_at) : '-'}
                    {reg.transaction?.[0]?.payment_type && (
                      <p className="text-slate-400">{reg.transaction[0].payment_type}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_COLOR[reg.status as keyof typeof STATUS_COLOR]
                      }`}
                    >
                      {STATUS_LABEL[reg.status as keyof typeof STATUS_LABEL]}
                    </span>
                    {reg.status === 'REJECTED' && reg.alasan_tolak && (
                      <p
                        className="text-xs text-red-500 mt-1 max-w-[140px] truncate"
                        title={reg.alasan_tolak}
                      >
                        {reg.alasan_tolak}
                      </p>
                    )}
                  </td>

                  {/* Sertifikat column */}
                  <td className="px-4 py-3">
                    {reg.status === 'APPROVED' ? (
                      <div className="flex flex-col gap-1.5 items-start">
                        <UploadSertifikat
                          registrationId={reg.id}
                          userId={reg.user_id}
                          existingSertifikatUrl={reg.sertifikat_url ?? null}
                        />
                        {sertifikatUrls[reg.id] ? (
                          <SertifikatPreview
                            url={sertifikatUrls[reg.id]}
                            nama={reg.user?.nama_lengkap ?? 'Peserta'}
                          />
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium">Belum diupload</span>
                        )}
                      </div>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-xs text-slate-300"
                        title="Upload sertifikat hanya tersedia setelah status APPROVED"
                      >
                        <Lock size={11} />
                        <span className="text-slate-300">—</span>
                      </span>
                    )}
                  </td>

                  {/* Aksi column */}
                  <td className="px-4 py-3">
                    {reg.status === 'PAID' ? (
                      <VerifyActions registrationId={reg.id} />
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!registrations.length && (
            <div className="px-4 py-10 text-center text-slate-400 text-sm">
              {hasFilter
                ? 'Tidak ada data yang cocok dengan filter saat ini.'
                : 'Tidak ada data untuk filter ini.'}
            </div>
          )}
        </div>

        {registrations.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            {registrations.length} pendaftar ditemukan
            {searchQuery && ` · pencarian "${searchParams.q}"`}
            {(filterDay || filterMonth || filterYear) && ' · difilter tanggal'}
          </div>
        )}
      </div>
    </div>
  )
}
