import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayoutShell from './_components/AdminLayoutShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <AdminLayoutShell nama={profile.nama_lengkap}>
      {children}
    </AdminLayoutShell>
  )
}
