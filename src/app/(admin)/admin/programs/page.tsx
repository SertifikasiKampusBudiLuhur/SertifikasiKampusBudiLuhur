import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatDate } from '@/lib/utils'
import { ProgramFormModal } from './ProgramFormModal'
import { Pencil, Trash2, Plus, Users } from 'lucide-react'

export default async function AdminProgramsPage() {
  const supabase = createClient()
  const { data: programs } = await supabase
    .from('certification_programs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Program Sertifikasi</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola program sertifikasi yang tersedia</p>
        </div>
        <ProgramFormModal mode="create" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nama Program', 'Biaya', 'Kuota', 'Tanggal', 'Status', 'Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-600 font-semibold text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {programs?.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{p.nama}</p>
                  {p.lokasi && <p className="text-xs text-slate-400">{p.lokasi}</p>}
                </td>
                <td className="px-4 py-3">{p.biaya === 0 ? 'Gratis' : formatRupiah(p.biaya)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-slate-400" />
                    <span>{p.kuota_terisi}/{p.kuota}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{formatDate(p.tanggal_mulai)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <ProgramFormModal mode="edit" program={p} />
                    <form action={`/api/admin/programs/${p.id}/delete`} method="POST">
                      <button type="submit"
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"
                        title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!programs?.length && (
          <div className="px-4 py-10 text-center text-slate-400 text-sm">
            Belum ada program. Klik "Tambah Program" untuk mulai.
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
