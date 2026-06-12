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
  status: string
  reservation_amount: number
  customers: { name: string; phone: string }
  services: { name: string }
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({
    todayBookings: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    totalCustomers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0]
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const [
      { data: todayData },
      { data: weekData },
      { data: monthData },
      { data: customersData },
      { data: recentBookings },
    ] = await Promise.all([
      supabase.from('bookings').select('reservation_amount').eq('appointment_date', today).eq('status', 'confirmed'),
      supabase.from('bookings').select('reservation_amount').gte('appointment_date', weekAgo).eq('status', 'confirmed'),
      supabase.from('bookings').select('reservation_amount').gte('appointment_date', monthAgo).eq('status', 'confirmed'),
      supabase.from('customers').select('id'),
      supabase.from('bookings')
        .select('*, customers(name, phone), services(name)')
        .order('appointment_date', { ascending: false })
        .limit(10),
    ])

    setStats({
      todayBookings: todayData?.length || 0,
      todayRevenue: todayData?.reduce((sum, b) => sum + b.reservation_amount, 0) || 0,
      weekRevenue: weekData?.reduce((sum, b) => sum + b.reservation_amount, 0) || 0,
      monthRevenue: monthData?.reduce((sum, b) => sum + b.reservation_amount, 0) || 0,
      totalCustomers: customersData?.length || 0,
    })
    setBookings(recentBookings || [])
    setLoading(false)
  }

  const statCards = [
    { label: "Today's Bookings", value: stats.todayBookings, prefix: '' },
    { label: "Today's Revenue", value: stats.todayRevenue, prefix: '₹' },
    { label: 'This Week', value: stats.weekRevenue, prefix: '₹' },
    { label: 'This Month', value: stats.monthRevenue, prefix: '₹' },
    { label: 'Total Customers', value: stats.totalCustomers, prefix: '' },
  ]

  return (
    <div className="min-h-screen bg-[#65222A] flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-1">Overview</p>
          <h1 className="text-[#EEF4FF] font-serif text-4xl font-light">Dashboard</h1>
        </div>

        {loading ? (
          <p className="text-[#A09C97] text-xs tracking-widest uppercase">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
              {statCards.map(card => (
                <div key={card.label} className="bg-[#532332] p-5 border border-[#EEF4FF]/10">
                  <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-3">{card.label}</p>
                  <p className="text-[#EEF4FF] font-serif text-3xl font-light">
                    {card.prefix}{card.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-4">Recent Bookings</p>
              <div className="border border-[#EEF4FF]/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#EEF4FF]/10 bg-[#532332]">
                      {['Customer', 'Service', 'Date', 'Time', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[#A09C97] text-xs tracking-widest uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-[#EEF4FF]/5 hover:bg-[#532332]/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-[#EEF4FF] text-sm">{b.customers?.name}</p>
                          <p className="text-[#A09C97] text-xs">{b.customers?.phone}</p>
                        </td>
                        <td className="px-4 py-3 text-[#EEF4FF] text-sm">{b.services?.name}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}