import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate, formatDateTime, STATUS_LABEL, STATUS_COLOR } from '@/lib/utils'
import { Download } from 'lucide-react'
import PayButton from './PayButton'

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: { payment?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: registrations } = await supabase
    .from('registrations')
    .select(`
      *,
      program:certification_programs(*),
      transaction:transactions(*)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Generate signed URLs untuk sertifikat yang sudah diupload
  const sertifikatUrls: Record<string, string> = {}
  if (registrations) {
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
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Riwayat Pendaftaran</h1>
        <p className="text-slate-500 mt-1 text-sm">Semua riwayat pendaftaran sertifikasimu</p>
      </div>

      {/* Payment notification banner */}
      {searchParams.payment === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
          ✅ Pembayaran berhasil! Status pendaftaranmu sedang diperbarui.
        </div>
      )}
      {searchParams.payment === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-4 py-3 mb-6 text-sm">
          ⏳ Pembayaran sedang diproses. Status akan terupdate otomatis setelah konfirmasi.
        </div>
      )}

      {!registrations?.length ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400 mb-4">Belum ada riwayat pendaftaran</p>
          <a href="/programs" className="btn-primary text-sm">Lihat Program Sertifikasi</a>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map((reg: any) => {
            const snapToken = reg.transaction?.[0]?.snap_token ?? null
            const canPay = reg.status === 'DRAFT' || reg.status === 'PENDING_PAYMENT'

            return (
              <div key={reg.id} className="card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-snug">{reg.program?.nama}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      Didaftarkan: {formatDateTime(reg.created_at)}
                    </p>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[reg.status as keyof typeof STATUS_COLOR]}`}>
                    {STATUS_LABEL[reg.status as keyof typeof STATUS_LABEL]}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm bg-slate-50 rounded-lg p-3">
                  <div>
                    <p className="text-slate-400 text-xs">Biaya</p>
                    <p className="font-medium text-sm">{formatRupiah(reg.program?.biaya ?? 0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Jadwal Pilihan</p>
                    <p className="font-medium text-sm">{reg.jadwal_pilihan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Metode Bayar</p>
                    <p className="font-medium text-sm">{reg.transaction?.[0]?.payment_type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Tanggal Bayar</p>
                    <p className="font-medium text-sm">
                      {reg.transaction?.[0]?.paid_at ? formatDate(reg.transaction[0].paid_at) : '-'}
                    </p>
                  </div>
                </div>

                {/* Bayar untuk DRAFT / PENDING_PAYMENT */}
                {canPay && (
                  <PayButton
                    registrationId={reg.id}
                    existingSnapToken={reg.status === 'PENDING_PAYMENT' ? snapToken : null}
                  />
                )}

                {/* Download sertifikat */}
                {reg.status === 'APPROVED' && sertifikatUrls[reg.id] && (
                  <div className="mt-3">
                    <a
                      href={sertifikatUrls[reg.id]}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Download size={15} />
                      Download Sertifikat
                    </a>
                  </div>
                )}

                {reg.status === 'APPROVED' && !sertifikatUrls[reg.id] && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-700">
                    Sertifikat sedang disiapkan oleh admin.
                  </div>
                )}

                {reg.status === 'REJECTED' && reg.alasan_tolak && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                    <span className="font-medium">Alasan penolakan:</span> {reg.alasan_tolak}
                    <br />
                    <span className="text-xs">Untuk refund, hubungi admin via WhatsApp.</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
