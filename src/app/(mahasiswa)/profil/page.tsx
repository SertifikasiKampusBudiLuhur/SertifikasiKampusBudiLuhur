import { createClient } from '@/lib/supabase/server'
import { User } from 'lucide-react'
import ProfileForm from './ProfileForm'

export default async function ProfilPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user!.id).single()

  let ktmSignedUrl: string | null = null
  if (profile?.ktm_url) {
    const { data } = await supabase.storage
      .from('ktm')
      .createSignedUrl(profile.ktm_url, 60 * 60) // 1 jam
    ktmSignedUrl = data?.signedUrl ?? null
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-0.5">Perbarui data diri dan upload KTM</p>
        </div>
      </div>

      <ProfileForm profile={profile} ktmSignedUrl={ktmSignedUrl} />
    </div>
  )
}
