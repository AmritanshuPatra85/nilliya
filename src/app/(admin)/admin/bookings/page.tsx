'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Booking = {
  id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: string
  reservation_amount: number
  customers: { name: string; phone: string }
  services: { name: string; category: string }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => { fetchBookings() }, [])

  useEffect(() => {
    let result = bookings
    if (filterDate) result = result.filter(b => b.appointment_date === filterDate)
    if (filterStatus !== 'all') result = result.filter(b => b.status === filterStatus)
    setFiltered(result)
  }, [filterDate, filterStatus, bookings])

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, customers(name, phone), services(name, category)')
      .order('appointment_date', { ascending: false })
    setBookings(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('bookings').update({ status }).eq('id', id)
    fetchBookings()
  }

  return (
    <div className="min-h-screen bg-[#65222A] flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-1">Manage</p>
          <h1 className="text-[#EEF4FF] font-serif text-4xl font-light">Bookings</h1>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-2 text-sm focus:outline-none focus:border-[#EEF4FF]/60"
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-2 text-sm focus:outline-none focus:border-[#EEF4FF]/60"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          {(filterDate || filterStatus !== 'all') && (
            <button
              onClick={() => { setFilterDate(''); setFilterStatus('all') }}
              className="text-[#A09C97] text-xs tracking-widest uppercase hover:text-[#EEF4FF] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-[#A09C97] text-xs tracking-widest uppercase">Loading...</p>
        ) : (
          <div className="border border-[#EEF4FF]/10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#EEF4FF]/10 bg-[#532332]">
                  {['Customer', 'Service', 'Date', 'Time', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[#A09C97] text-xs tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[#A09C97] text-xs tracking-widest uppercase">
                      No bookings found
                    </td>
                  </tr>
                ) : filtered.map(b => (
                  <tr key={b.id} className="border-b border-[#EEF4FF]/5 hover:bg-[#532332]/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-[#EEF4FF] text-sm">{b.customers?.name}</p>
                      <p className="text-[#A09C97] text-xs">{b.customers?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#EEF4FF] text-sm">{b.services?.name}</p>
                      <p className="text-[#A09C97] text-xs">{b.services?.category}</p>
                    </td>
                    <td className="px-4 py-3 text-[#EEF4FF] text-sm">{b.appointment_date}</td>
                    <td className="px-4 py-3 text-[#EEF4FF] text-sm">{b.start_time?.slice(0, 5)}</td>
                    <td className="px-4 py-3 text-[#EEF4FF] text-sm">₹{b.reservation_amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs tracking-widest uppercase px-2 py-1 ${
                        b.status === 'confirmed' ? 'bg-green-900/40 text-green-400' :
                        b.status === 'cancelled' ? 'bg-red-900/40 text-red-400' :
                        'bg-yellow-900/40 text-yellow-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed')}
                            className="text-xs text-green-400 hover:text-green-300 tracking-widest uppercase"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            className="text-xs text-red-400 hover:text-red-300 tracking-widest uppercase"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}