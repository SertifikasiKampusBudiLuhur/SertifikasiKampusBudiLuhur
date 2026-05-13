import { createClient } from '@/lib/supabase/server'
import {
  Users, Clock, CheckCircle, XCircle, BookOpen,
  TrendingUp, Banknote, AlertCircle, BarChart3, Award,
} from 'lucide-react'
import { formatRupiah, formatDateTime, STATUS_COLOR, STATUS_LABEL } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  // ── Data queries paralel ──────────────────────────────────────────
  const [
    { data: allRegs },
    { data: paidApprovedRegs },
    { data: programs },
    { data: needVerify },
    { data: recent },
  ] = await Promise.all([
    supabase.from('registrations').select('status, program_id'),
    supabase
      .from('registrations')
      .select('status, program_id, program:certification_programs(id, nama, biaya, kuota, kuota_terisi, is_active)')
      .in('status', ['PAID', 'APPROVED']),
    supabase
      .from('certification_programs')
      .select('id, nama, biaya, kuota, kuota_terisi, is_active, tanggal_mulai')
      .order('tanggal_mulai', { ascending: false }),
    supabase
      .from('registrations')
      .select('id, updated_at, user:profiles!user_id(nama_lengkap, nim, program_studi), program:certification_programs(nama, biaya)')
      .eq('status', 'PAID')
      .order('updated_at', { ascending: false })
      .limit(6),
    supabase
      .from('registrations')
      .select('*, user:profiles!user_id(nama_lengkap, nim), program:certification_programs(nama)')
      .in('status', ['PAID', 'APPROVED', 'REJECTED'])
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  // ── Status stats ──────────────────────────────────────────────────
  const statMap = {
    total: allRegs?.length ?? 0,
    pending_payment: allRegs?.filter(r => r.status === 'PENDING_PAYMENT').length ?? 0,
    paid: allRegs?.filter(r => r.status === 'PAID').length ?? 0,
    approved: allRegs?.filter(r => r.status === 'APPROVED').length ?? 0,
    rejected: allRegs?.filter(r => r.status === 'REJECTED').length ?? 0,
    draft: allRegs?.filter(r => r.status === 'DRAFT').length ?? 0,
  }

  // ── Revenue stats ─────────────────────────────────────────────────
  const revenueMasuk = paidApprovedRegs?.reduce((sum, r: any) => sum + (r.program?.biaya ?? 0), 0) ?? 0
  const revenueApproved = paidApprovedRegs
    ?.filter(r => r.status === 'APPROVED')
    .reduce((sum, r: any) => sum + (r.program?.biaya ?? 0), 0) ?? 0
  const revenuePendingVerif = paidApprovedRegs
    ?.filter(r => r.status === 'PAID')
    .reduce((sum, r: any) => sum + (r.program?.biaya ?? 0), 0) ?? 0

  const approvalRate = statMap.approved + statMap.rejected > 0
    ? Math.round((statMap.approved / (statMap.approved + statMap.rejected)) * 100)
    : null

  // ── Revenue & peserta per program ─────────────────────────────────
  const programStats = programs?.map(prog => {
    const regs = paidApprovedRegs?.filter((r: any) => r.program_id === prog.id) ?? []
    const pesertaPaid = regs.filter(r => r.status === 'PAID').length
    const pesertaApproved = regs.filter(r => r.status === 'APPROVED').length
    const revenue = regs.reduce((sum: number, r: any) => sum + (r.program?.biaya ?? prog.biaya), 0)
    const fillRate = prog.kuota > 0 ? Math.round((prog.kuota_terisi / prog.kuota) * 100) : 0
    return { ...prog, pesertaPaid, pesertaApproved, revenue, fillRate }
  }).sort((a, b) => b.revenue - a.revenue) ?? []

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
          <p className="text-slate-500 mt-1">Ringkasan sistem registrasi sertifikasi</p>
        </div>
        <Link href="/admin/registrations?status=PAID"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <AlertCircle size={15} />
          {statMap.paid} Perlu Verifikasi
        </Link>
      </div>

      {/* ── Row 1: Status cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Pendaftar', value: statMap.total,           icon: <Users size={18} />,        color: 'text-slate-600 bg-slate-100' },
          { label: 'Pending Payment', value: statMap.pending_payment, icon: <Clock size={18} />,        color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Sudah Bayar',     value: statMap.paid,            icon: <BookOpen size={18} />,     color: 'text-blue-600 bg-blue-50' },
          { label: 'Diterima',        value: statMap.approved,        icon: <CheckCircle size={18} />,  color: 'text-green-600 bg-green-50' },
          { label: 'Ditolak',         value: statMap.rejected,        icon: <XCircle size={18} />,      color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className={`inline-flex p-2 rounded-lg ${s.color} mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Revenue cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Revenue Masuk</p>
            <Banknote size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatRupiah(revenueMasuk)}</p>
          <p className="text-xs text-slate-400 mt-1">Dari peserta PAID + APPROVED</p>
        </div>

        <div className="card p-5 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue Terverifikasi</p>
            <CheckCircle size={18} className="text-green-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatRupiah(revenueApproved)}</p>
          <p className="text-xs text-slate-400 mt-1">Dari {statMap.approved} peserta APPROVED</p>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-400">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Menunggu Verifikasi</p>
            <Clock size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{formatRupiah(revenuePendingVerif)}</p>
          <p className="text-xs text-slate-400 mt-1">Dari {statMap.paid} peserta PAID</p>
        </div>

        <div className="card p-5 border-l-4 border-l-purple-400">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Approval Rate</p>
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {approvalRate !== null ? `${approvalRate}%` : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {statMap.approved} diterima / {statMap.approved + statMap.rejected} diproses
          </p>
        </div>
      </div>

      {/* ── Row 3: Revenue per program + Perlu verifikasi ─────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue per program — 2/3 width */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-slate-500" />
              <h2 className="font-semibold text-slate-800">Revenue per Program</h2>
            </div>
            <Link href="/admin/programs" className="text-xs text-blue-600 hover:underline">Kelola program</Link>
          </div>

          {!programStats.length ? (
            <div className="px-5 py-10 text-center text-slate-400 text-sm">Belum ada program</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {programStats.map(prog => (
                <div key={prog.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium text-slate-800 truncate text-sm">{prog.nama}</p>
                        <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          prog.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {prog.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatRupiah(prog.biaya)} / peserta
                        {' · '}
                        <span className="text-blue-600 font-medium">{prog.pesertaPaid}</span> menunggu
                        {' · '}
                        <span className="text-green-600 font-medium">{prog.pesertaApproved}</span> diterima
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-emerald-700">{formatRupiah(prog.revenue)}</p>
                      <p className="text-xs text-slate-400">{prog.pesertaPaid + prog.pesertaApproved} peserta bayar</p>
                    </div>
                  </div>

                  {/* Kuota fill bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          prog.fillRate >= 90 ? 'bg-red-400' :
                          prog.fillRate >= 60 ? 'bg-yellow-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.min(prog.fillRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 w-20 text-right">
                      {prog.kuota_terisi}/{prog.kuota} kuota ({prog.fillRate}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total row */}
          {programStats.length > 0 && (
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {programs?.length} program · {statMap.paid + statMap.approved} peserta bayar
              </span>
              <span className="text-sm font-bold text-emerald-700">{formatRupiah(revenueMasuk)} total</span>
            </div>
          )}
        </div>

        {/* Perlu verifikasi segera — 1/3 width */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-500" />
              <h2 className="font-semibold text-slate-800">Perlu Verifikasi</h2>
            </div>
            {statMap.paid > 0 && (
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {statMap.paid}
              </span>
            )}
          </div>

          {!needVerify?.length ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle size={32} className="mx-auto text-green-400 mb-2" />
              <p className="text-sm text-slate-400">Semua sudah diverifikasi</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {needVerify.map((reg: any) => (
                  <div key={reg.id} className="px-4 py-3">
                    <p className="font-medium text-slate-800 text-sm truncate">{reg.user?.nama_lengkap}</p>
                    <p className="text-xs text-slate-400 truncate">{reg.user?.nim} · {reg.user?.program_studi}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-slate-500 truncate mr-2">{reg.program?.nama}</p>
                      <span className="text-xs font-semibold text-emerald-700 flex-shrink-0">
                        {formatRupiah(reg.program?.biaya ?? 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-100">
                <Link href="/admin/registrations?status=PAID"
                  className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Lihat semua {statMap.paid} pendaftar →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 4: Program terkecil & info ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award size={18} className="text-yellow-500" />
            <p className="font-semibold text-slate-800 text-sm">Program Terlaris</p>
          </div>
          {programStats[0] ? (
            <>
              <p className="font-bold text-slate-900 line-clamp-2 leading-snug mb-1">{programStats[0].nama}</p>
              <p className="text-emerald-700 font-bold text-lg">{formatRupiah(programStats[0].revenue)}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {programStats[0].pesertaPaid + programStats[0].pesertaApproved} peserta bayar
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">Belum ada data</p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-blue-500" />
            <p className="font-semibold text-slate-800 text-sm">Total Program Aktif</p>
          </div>
          <p className="text-3xl font-black text-slate-900">
            {programs?.filter(p => p.is_active).length ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            dari {programs?.length ?? 0} program terdaftar
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-purple-500" />
            <p className="font-semibold text-slate-800 text-sm">Rata-rata Revenue / Program</p>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {programStats.filter(p => p.revenue > 0).length > 0
              ? formatRupiah(Math.round(revenueMasuk / programStats.filter(p => p.revenue > 0).length))
              : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            dari {programStats.filter(p => p.revenue > 0).length} program dengan peserta bayar
          </p>
        </div>
      </div>

      {/* ── Row 5: Aktivitas terbaru ─────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Aktivitas Terbaru</h2>
          <Link href="/admin/registrations" className="text-sm text-blue-600 hover:underline">Lihat semua</Link>
        </div>
        {!recent?.length ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">Belum ada aktivitas</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((reg: any) => (
              <div key={reg.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm truncate">{reg.user?.nama_lengkap}</p>
                  <p className="text-xs text-slate-400 truncate">{reg.user?.nim} · {reg.program?.nama}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{formatDateTime(reg.updated_at)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_COLOR[reg.status as keyof typeof STATUS_COLOR]}`}>
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
