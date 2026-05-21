'use client'

import { useState, useEffect } from 'react'

// Background slides — bertema kampus, edukasi & teknologi
const SLIDES = [
  'https://images.unsplash.com/photo-1758270704587-43339a801396?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1536148935331-408321065b18?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1691435828932-911a7801adfb?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1753715613457-63127ec40824?auto=format&fit=crop&w=1920&q=80',
]

const INTERVAL = 5000

export default function HeroSlider({ children }: { children: React.ReactNode }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % SLIDES.length)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative overflow-hidden text-white">
      {/* Rotating background images — cross-fade */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{ backgroundImage: `url('${src}')`, opacity: i === idx ? 1 : 0 }}
        />
      ))}

      {/* Navy overlay — keeps text readable */}
      <div className="absolute inset-0 bg-blue-800/75" />
      {/* Bottom gradient blend */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white/5 to-transparent" />

      {/* Content */}
      <div className="relative">{children}</div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Tampilkan slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === idx ? 'w-7 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
