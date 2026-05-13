import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Rute yang butuh login
  const mahasiswaRoutes = ['/dashboard', '/programs', '/daftar', '/riwayat', '/jadwal', '/profil']
  const adminRoutes = ['/admin/dashboard', '/admin/programs', '/admin/registrations']

  const isMahasiswaRoute = mahasiswaRoutes.some(r => pathname.startsWith(r))
  const isAdminRoute = adminRoutes.some(r => pathname.startsWith(r))

  if (!user) {
    if (isMahasiswaRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return supabaseResponse
  }

  // Cek role untuk admin routes
  if (isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect dari auth pages jika sudah login
  if (['/login', '/register', '/admin/login'].includes(pathname)) {
  if (!user) return supabaseResponse 
  
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  
  if (pathname === '/admin/login' && profile?.role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }
  if (['/login', '/register'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/midtrans/notification).*)',
  ],
}
