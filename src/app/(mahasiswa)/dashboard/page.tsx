import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate, STATUS_LABEL, STATUS_COLOR } from '@/lib/utils'
import { BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Registration } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, program:certification_programs(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = {
    total: registrations?.length ?? 0,
    pending: registrations?.filter(r => ['PENDING_PAYMENT', 'PAID'].includes(r.status)).length ?? 0,
    approved: registrations?.filter(r => r.status === 'APPROVED').length ?? 0,
    rejected: registrations?.filter(r => r.status === 'REJECTED').length ?? 0,
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Halo, {profile?.nama_lengkap?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">NIM: {profile?.nim} · {profile?.program_studi}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: 'Total Pendaftaran', value: stats.total, icon: <BookOpen size={20} />, color: 'text-blue-600 bg-blue-50' },
          { label: 'Sedang Diproses', value: stats.pending, icon: <Clock size={20} />, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Diterima', value: stats.approved, icon: <CheckCircle size={20} />, color: 'text-green-600 bg-green-50' },
          { label: 'Ditolak', value: stats.rejected, icon: <XCircle size={20} />, color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Pendaftaran Terbaru</h2>
          <Link href="/riwayat" className="text-sm text-blue-600 hover:underline">Lihat semua</Link>
        </div>

        {!registrations?.length ? (
          <div className="px-5 py-12 text-center">
            <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="text-slate-500">Belum ada pendaftaran</p>
            <Link href="/programs" className="btn-primary mt-4 inline-block text-sm">
              Lihat Program Sertifikasi
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {registrations.map((reg: Registration & { program: any }) => (
              <div key={reg.id} className="px-4 sm:px-5 py-4 flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm sm:text-base line-clamp-2 sm:truncate">{reg.program?.nama}</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    {formatDate(reg.created_at)} · {formatRupiah(reg.program?.biaya ?? 0)}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[reg.status as keyof typeof STATUS_COLOR]}`}>
                  {STATUS_LABEL[reg.status as keyof typeof STATUS_LABEL]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
