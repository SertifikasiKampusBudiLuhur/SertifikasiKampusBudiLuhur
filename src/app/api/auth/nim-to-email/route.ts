import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { nim } = await req.json()
  if (!nim || typeof nim !== 'string') {
    return NextResponse.json({ error: 'NIM tidak valid.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('nim', nim.trim())
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'NIM tidak ditemukan.' }, { status: 404 })
  }

  const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(profile.id)
  if (authError || !user?.email) {
    return NextResponse.json({ error: 'Gagal mengambil data akun.' }, { status: 500 })
  }

  return NextResponse.json({ email: user.email })
}
