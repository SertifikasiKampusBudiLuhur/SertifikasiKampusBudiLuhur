import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sertifikasi Kampus',
  description: 'Sistem Registrasi Sertifikasi Kampus — Paket Basic',
  icons: {
    icon: '/logo/Logo BLU Square Colour.png',
    apple: '/logo/Logo BLU Square Colour.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  )
}
