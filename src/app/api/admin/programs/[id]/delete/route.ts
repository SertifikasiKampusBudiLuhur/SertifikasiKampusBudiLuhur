import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verifikasi: hanya admin yang boleh menghapus program
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
  }

  // Hapus program (registrations & transactions ikut terhapus via ON DELETE CASCADE)
  const service = createServiceClient()
  const { error } = await service
    .from('certification_programs')
    .delete()
    .eq('id', params.id)

  const url = new URL('/admin/programs', request.url)
  url.searchParams.set(error ? 'error' : 'deleted', error ? error.message : '1')
  return NextResponse.redirect(url, { status: 303 })
}
