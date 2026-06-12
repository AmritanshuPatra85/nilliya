'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

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

type Service = {
  id: string
  category: string
  name: string
  duration_minutes: number
  price_min: number
  price_max: number
}

type Variant = {
  id: string
  service_id: string
  name: string
  price: number
  duration_minutes: number
}

type WorkingHours = {
  day_of_week: number
  open_time: string
  close_time: string
  is_off: boolean
}

type BookingSettings = {
  booking_window_days: number
  max_bookings_per_slot: number
  closed_dates: string[]
}

export default function BookPage() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    booking_window_days: 5,
    max_bookings_per_slot: 1,
    closed_dates: [],
  })

  const [selectedCategory, setSelectedCategory] = useState('Face')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: s }, { data: v }, { data: w }, { data: bs }] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true),
        supabase.from('service_variants').select('*'),
        supabase.from('working_hours').select('*'),
        supabase.from('booking_settings').select('*').eq('id', 1).single(),
      ])
      if (s) setServices(s)
      if (v) setVariants(v)
      if (w) setWorkingHours(w)
      if (bs) setBookingSettings(bs)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedDate || !selectedService) return
    generateSlots()
  }, [selectedDate, selectedService, selectedVariant, bookingSettings])

  const generateSlots = async () => {
    if (!selectedDate || !selectedService) return

    if (bookingSettings.closed_dates.includes(selectedDate)) {
      setAvailableSlots([])
      return
    }

    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay()

    const dayHours = workingHours.filter(
      h => h.day_of_week === dayOfWeek && !h.is_off
    )

    if (!dayHours.length) {
      setAvailableSlots([])
      return
    }

    const duration =
      selectedVariant?.duration_minutes || selectedService.duration_minutes

    const slots: string[] = []

    for (const period of dayHours) {
      const [openH, openM] = period.open_time.split(':').map(Number)
      const [closeH, closeM] = period.close_time.split(':').map(Number)

      let current = openH * 60 + openM
      const end = closeH * 60 + closeM

      while (current + duration <= end) {
        const h = Math.floor(current / 60)
        const m = current % 60
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        slots.push(timeStr)
        current += 30
      }
    }

    const supabase = createClient()
    const { data: booked } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('appointment_date', selectedDate)
      .neq('status', 'cancelled')

    const bookedCounts = booked?.reduce((acc, b) => {
      const t = b.start_time.slice(0, 5)
      acc[t] = (acc[t] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    setAvailableSlots(
      slots.filter(s => (bookedCounts[s] || 0) < bookingSettings.max_bookings_per_slot)
    )
  }

  const serviceVariants = variants.filter(
    v => v.service_id === selectedService?.id
  )

  const hasVariants = serviceVariants.length > 0

  const reservationAmount = selectedVariant
    ? Math.round(selectedVariant.price * 0.5)
    : selectedService
    ? Math.round(selectedService.price_min * 0.5)
    : 0

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat)
    return acc
  }, {} as Record<string, Service[]>)

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const max = new Date()
    max.setDate(max.getDate() + bookingSettings.booking_window_days)
    return max.toISOString().split('T')[0]
  }

  const handleProceedToDateTime = () => {
    if (!selectedService) return
    if (hasVariants && !selectedVariant) return
    setStep(2)
  }

  const handleProceedToDetails = () => {
    if (!selectedDate || !selectedSlot) return
    setStep(3)
  }

  const handlePayment = async () => {
    if (!name || !phone) return
    setLoading(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: reservationAmount,
          name,
          phone,
          email,
          serviceId: selectedService!.id,
          variantId: selectedVariant?.id || null,
          date: selectedDate,
          startTime: selectedSlot,
          duration:
            selectedVariant?.duration_minutes ||
            selectedService!.duration_minutes,
        }),
      })

      const { orderId, bookingId } = await res.json()

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: reservationAmount * 100,
        currency: 'INR',
        name: 'Nillya The Makeup Studio',
        description: selectedService!.name,
        order_id: orderId,
        prefill: { name, contact: phone, email },
        theme: { color: '#532332' },
        handler: async (response: any) => {
          await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, bookingId }),
          })
          setStep(4)
        },
      })

      rzp.open()
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const buildWhatsappUrl = () => {
    const msg =
      'Hi! I just booked an appointment at Nillya The Makeup Studio.\n\n' +
      'Service: ' + (selectedService?.name || '') +
      (selectedVariant ? ' (' + selectedVariant.name + ')' : '') +
      '\nDate: ' + selectedDate +
      '\nTime: ' + selectedSlot +
      '\nReservation Paid: Rs.' + reservationAmount +
      '\n\nPlease confirm my booking.'
    return 'https://wa.me/916372806696?text=' + encodeURIComponent(msg)
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#65222A] pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">

          <div className="text-center mb-12">
            <p className="text-[#A09C97] text-xs tracking-[0.4em] uppercase mb-3">
              Reserve Your Spot
            </p>
            <h1 className="text-[#EEF4FF] font-serif text-5xl font-light tracking-wide">
              Book Appointment
            </h1>
          </div>

          {step < 4 && (
            <div className="flex items-center justify-center gap-4 mb-12">
              {['Service', 'Date & Time', 'Details'].map((label, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        step > i + 1
                          ? 'bg-[#EEF4FF] text-[#532332]'
                          : step === i + 1
                          ? 'bg-[#EEF4FF] text-[#532332]'
                          : 'border border-[#EEF4FF]/30 text-[#EEF4FF]/30'
                      }`}
                    >
                      {step > i + 1 ? '✓' : i + 1}
                    </div>
                    <span
                      className={`text-xs tracking-widest uppercase ${
                        step === i + 1 ? 'text-[#EEF4FF]' : 'text-[#EEF4FF]/30'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className="w-8 h-px bg-[#EEF4FF]/20" />}
                </div>
              ))}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="flex flex-wrap gap-2 mb-8">
                {CATEGORY_ORDER.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat)
                      setSelectedService(null)
                      setSelectedVariant(null)
                    }}
                    className={
                      selectedCategory === cat
                        ? 'px-4 py-2 text-xs tracking-widest uppercase bg-[#EEF4FF] text-[#532332] font-semibold'
                        : 'px-4 py-2 text-xs tracking-widest uppercase border border-[#EEF4FF]/20 text-[#EEF4FF]/60 hover:border-[#EEF4FF]/50 hover:text-[#EEF4FF]'
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {grouped[selectedCategory]?.map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setSelectedVariant(null)
                    }}
                    className={`p-5 text-left border transition-all duration-200 ${
                      selectedService?.id === service.id
                        ? 'border-[#EEF4FF] bg-[#532332]'
                        : 'border-[#EEF4FF]/10 bg-[#532332]/30 hover:border-[#EEF4FF]/40'
                    }`}
                  >
                    <p className="text-[#EEF4FF] font-serif text-lg mb-1">{service.name}</p>
                    <p className="text-[#A09C97] text-xs tracking-widest">{service.duration_minutes} min</p>
                  </button>
                ))}
              </div>

              {selectedService && hasVariants && (
                <div className="mb-8">
                  <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-4">Select Variant</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {serviceVariants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`p-4 text-left border transition-all duration-200 ${
                          selectedVariant?.id === v.id
                            ? 'border-[#EEF4FF] bg-[#532332]'
                            : 'border-[#EEF4FF]/10 bg-[#532332]/30 hover:border-[#EEF4FF]/40'
                        }`}
                      >
                        <p className="text-[#EEF4FF] text-sm font-medium mb-1">{v.name}</p>
                        <p className="text-[#A09C97] text-xs">Rs.{v.price}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleProceedToDateTime}
                disabled={!selectedService || (hasVariants && !selectedVariant)}
                className="w-full bg-[#EEF4FF] text-[#532332] py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue to Date & Time
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-4">Select Date</p>
                <p className="text-[#A09C97] text-xs mb-3">
                  Bookings are available up to {bookingSettings.booking_window_days} days in advance.
                </p>
                <input
                  type="date"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value)
                    setSelectedSlot('')
                  }}
                  className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3 focus:outline-none focus:border-[#EEF4FF]/60"
                />
              </div>

              {selectedDate && (
                <div className="mb-8">
                  <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-4">Select Time</p>
                  {bookingSettings.closed_dates.includes(selectedDate) ? (
                    <p className="text-[#A09C97] text-sm">
                      This date is unavailable. Please select another date.
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-[#A09C97] text-sm">No slots available for this date.</p>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 text-sm tracking-wider border transition-all ${
                            selectedSlot === slot
                              ? 'bg-[#EEF4FF] text-[#532332] border-[#EEF4FF] font-semibold'
                              : 'border-[#EEF4FF]/20 text-[#EEF4FF]/70 hover:border-[#EEF4FF]/50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleProceedToDetails}
                disabled={!selectedDate || !selectedSlot}
                className="w-full bg-[#EEF4FF] text-[#532332] py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue to Details
              </button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3"
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3"
                />
              </div>

              <div className="border border-[#EEF4FF]/10 bg-[#532332]/30 p-4 mb-6">
                <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-2">Cancellation Policy</p>
                <p className="text-[#A09C97] text-sm leading-relaxed">
                  Cancellations made more than 2 hours before your appointment will receive a{' '}
                  <span className="text-[#EEF4FF]">70% refund</span> of the reservation amount.
                  No refunds for cancellations within 2 hours of the appointment.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={!name || !phone || loading}
                className="w-full bg-[#EEF4FF] text-[#532332] py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay Rs.' + reservationAmount}
              </button>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full border-2 border-[#EEF4FF] flex items-center justify-center mx-auto mb-8">
                <span className="text-[#EEF4FF] text-3xl">✓</span>
              </div>

              <h2 className="text-[#EEF4FF] font-serif text-4xl font-light mb-4">
                Booking Confirmed
              </h2>

              <p className="text-[#A09C97] mb-2">Thank you, {name}!</p>

              <p className="text-[#A09C97] text-sm mb-8">
                Your appointment for{' '}
                <span className="text-[#EEF4FF]">{selectedService?.name}</span>{' '}
                on <span className="text-[#EEF4FF]">{selectedDate}</span>{' '}
                at <span className="text-[#EEF4FF]">{selectedSlot}</span>{' '}
                is confirmed.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a
                  href={buildWhatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-green-500 transition-all"
                >
                  Confirm on WhatsApp
                </a>
                <a
                  href="/"
                  className="inline-block border border-[#EEF4FF]/30 text-[#EEF4FF] px-8 py-4 text-sm tracking-widest uppercase hover:border-[#EEF4FF] transition-all"
                >
                  Back to Home
                </a>
              </div>

              <p className="text-[#A09C97] text-xs">
                Tap the button above to send your booking details to the studio on WhatsApp
              </p>
            </div>
          )}

        </div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </>
  )
}