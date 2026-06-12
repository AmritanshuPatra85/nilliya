'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#65222A]">
      
      {/* Background decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#532332] opacity-40 blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#7E5A4C] opacity-30 blur-3xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[#532332] opacity-20 blur-2xl -translate-x-1/2 -translate-y-1/2" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Logo Circle */}
        <div
          className={`transition-all duration-1000 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        >
          <div className="w-36 h-36 mx-auto mb-8 rounded-full border-2 border-[#EEF4FF]/40 bg-[#532332] flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <p className="text-[#EEF4FF] font-serif text-3xl font-light tracking-widest">N</p>
            </div>
          </div>
        </div>

        {/* Studio name */}
        <div className={`transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[#A09C97] text-xs tracking-[0.4em] uppercase mb-3">Welcome to</p>
          <h1 className="text-[#EEF4FF] font-serif text-6xl md:text-8xl font-light tracking-widest mb-2">
            NILLYA
          </h1>
          <p className="text-[#A09C97] text-sm tracking-[0.3em] uppercase mb-8">
            The Makeup Studio
          </p>
        </div>

        {/* Divider */}
        <div className={`transition-all duration-1000 delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-[#A09C97]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A09C97]" />
            <div className="h-px w-16 bg-[#A09C97]/50" />
          </div>
        </div>

        {/* Tagline */}
        <div className={`transition-all duration-1000 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[#EEF4FF]/70 text-lg md:text-xl font-light tracking-wide mb-12 max-w-lg mx-auto leading-relaxed">
            Where every woman deserves to feel beautiful, confident, and celebrated.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className={`transition-all duration-1000 delay-500 flex flex-col sm:flex-row gap-4 justify-center ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link
            href="/book"
            className="bg-[#EEF4FF] text-[#532332] px-10 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all duration-300 shadow-lg"
          >
            Book Appointment
          </Link>
          <button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-[#EEF4FF]/40 text-[#EEF4FF] px-10 py-4 text-sm tracking-widest uppercase hover:border-[#EEF4FF] hover:bg-[#EEF4FF]/10 transition-all duration-300"
          >
            Our Services
          </button>
        </div>

        {/* Scroll indicator */}
        <div className={`transition-all duration-1000 delay-700 mt-16 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <p className="text-[#A09C97] text-xs tracking-widest uppercase">Scroll</p>
            <div className="w-px h-8 bg-[#A09C97]/50" />
          </div>
        </div>

      </div>
    </section>
  )
}