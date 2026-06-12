'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_ORDER = [
  'Face',
  'Facial & Clean Up',
  'Waxing',
  'Massage',
  'Hair Cut',
  'Hair Spa',
  'Hair Treatment',
  'Hand & Legs Care',
  'Makeups',
]

const CATEGORY_ICONS: Record<string, string> = {
  'Face': '✦',
  'Facial & Clean Up': '◈',
  'Waxing': '◇',
  'Massage': '❋',
  'Hair Cut': '✂',
  'Hair Spa': '◉',
  'Hair Treatment': '✺',
  'Hand & Legs Care': '◈',
  'Makeups': '✦',
}

type Service = {
  id: string
  category: string
  name: string
  duration_minutes: number
  price_min: number
  price_max: number
}

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([])
  const [activeCategory, setActiveCategory] = useState('Face')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category')
      if (data) setServices(data)
      setLoading(false)
    }
    fetchServices()
  }, [])

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <section id="services" className="py-24 bg-[#532332]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#A09C97] text-xs tracking-[0.4em] uppercase mb-4">What We Offer</p>
          <h2 className="text-[#EEF4FF] font-serif text-5xl md:text-6xl font-light tracking-wide mb-4">
            Our Services
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-[#A09C97]/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A09C97]" />
            <div className="h-px w-16 bg-[#A09C97]/50" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORY_ORDER.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat
                ? 'px-4 py-2 text-xs tracking-widest uppercase bg-[#EEF4FF] text-[#532332] font-semibold'
                : 'px-4 py-2 text-xs tracking-widest uppercase border border-[#EEF4FF]/20 text-[#EEF4FF]/60 hover:border-[#EEF4FF]/50 hover:text-[#EEF4FF]'}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-[#A09C97] tracking-widest uppercase text-sm py-20">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grouped[activeCategory]?.map(service => (
              <div
                key={service.id}
                className="border border-[#EEF4FF]/10 bg-[#65222A]/40 p-6 hover:border-[#EEF4FF]/30 hover:bg-[#65222A]/60 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[#A09C97] text-lg">
                    {CATEGORY_ICONS[service.category]}
                  </span>
                  <span className="text-[#A09C97] text-xs tracking-widest">
                    {service.duration_minutes} min
                  </span>
                </div>
                <h3 className="text-[#EEF4FF] font-serif text-xl font-light mb-2">
                  {service.name}
                </h3>
                <div className="h-px w-8 bg-[#A09C97]/30 mb-3" />
                <p className="text-[#A09C97] text-xs tracking-wider uppercase">
                  Book to enquire pricing
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <a href="/book" className="inline-block bg-[#EEF4FF] text-[#532332] px-12 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all duration-300">
            Book an Appointment
          </a>
        </div>
      </div>
    </section>
  )
}