export default function FooterApp() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-1 text-xs text-slate-400">
        <span>© {year} Universitas Budi Luhur. All Rights Reserved.</span>
        <span>Sistem Registrasi Sertifikasi Kampus</span>
      </div>
    </footer>
  )
}
