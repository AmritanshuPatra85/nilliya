'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#532332] shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#65222A] border-2 border-[#EEF4FF]/30 flex items-center justify-center overflow-hidden">
            <span className="text-[#EEF4FF] font-serif text-lg font-bold">N</span>
          </div>
          <div>
            <p className="text-[#EEF4FF] font-serif text-xl tracking-widest leading-none">NILLYA</p>
            <p className="text-[#A09C97] text-[10px] tracking-[0.2em] uppercase">The Makeup Studio</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('services')}
            className="text-[#EEF4FF]/80 hover:text-[#EEF4FF] text-sm tracking-widest uppercase transition-colors duration-300"
          >
            Services
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="text-[#EEF4FF]/80 hover:text-[#EEF4FF] text-sm tracking-widest uppercase transition-colors duration-300"
          >
            Gallery
          </button>
          <Link
            href="/book"
            className="bg-[#EEF4FF] text-[#532332] px-6 py-2 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all duration-300"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`block w-6 h-0.5 bg-[#EEF4FF] transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-[#EEF4FF] transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-[#EEF4FF] transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${menuOpen ? 'max-h-64' : 'max-h-0'}`}>
        <div className="bg-[#532332] px-6 py-4 flex flex-col gap-4 border-t border-[#EEF4FF]/10">
          <button
            onClick={() => scrollTo('services')}
            className="text-[#EEF4FF]/80 text-sm tracking-widest uppercase text-left py-2"
          >
            Services
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="text-[#EEF4FF]/80 text-sm tracking-widest uppercase text-left py-2"
          >
            Gallery
          </button>
          <Link
            href="/book"
            onClick={() => setMenuOpen(false)}
            className="bg-[#EEF4FF] text-[#532332] px-6 py-3 text-sm tracking-widest uppercase font-semibold text-center"
          >
            Book Now
          </Link>
        </div>
      </div>
    </nav>
  )
}