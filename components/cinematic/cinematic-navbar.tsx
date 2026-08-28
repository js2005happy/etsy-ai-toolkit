'use client'

import { useEffect, useState } from 'react'

const links = ['Direction', 'Color', 'Motion']

export default function CinematicNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-6 z-50 flex justify-center px-6 transition-all duration-500 ease-out ${
        scrolled ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
      }`}
    >
      <nav className="glass-cinematic flex h-16 items-center gap-1 rounded-full px-3">
        <span className="px-4 font-display text-xl font-semibold italic text-white">Lumen</span>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
            >
              {l}
            </a>
          ))}
        </div>
        <a
          href="#"
          className="ml-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-300 hover:scale-[1.04]"
        >
          Start
        </a>
      </nav>
    </header>
  )
}
