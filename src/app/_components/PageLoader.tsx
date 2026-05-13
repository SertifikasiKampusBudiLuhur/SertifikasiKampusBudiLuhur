import Image from 'next/image'

export default function PageLoader({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        dark ? 'bg-slate-900' : 'bg-white'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Outer ring — lambat */}
        <div
          className={`absolute w-24 h-24 rounded-full border-4 animate-spin ${
            dark
              ? 'border-slate-700 border-t-blue-400'
              : 'border-slate-100 border-t-blue-500'
          }`}
          style={{ animationDuration: '1.4s' }}
        />
        {/* Inner ring — cepat, berlawanan arah */}
        <div
          className={`absolute w-40 h-40 rounded-full border-2 animate-spin ${
            dark
              ? 'border-slate-700 border-b-blue-300'
              : 'border-slate-100 border-b-blue-300'
          }`}
          style={{ animationDuration: '0.8s', animationDirection: 'reverse' }}
        />
        {/* Logo */}
        <Image
          src="/logo/Logo BLU Square Colour.png"
          alt="BLU"
          width={100}
          height={100}
          className="w-20 h-20 object-contain relative z-10"
          priority
        />
      </div>
    </div>
  )
}
