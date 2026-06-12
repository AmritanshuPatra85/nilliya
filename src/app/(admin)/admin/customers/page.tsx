'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Customer = {
  id: string
  name: string
  phone: string
  email: string
  created_at: string
  bookings: { id: string }[]
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*, bookings(id)')
      .order('created_at', { ascending: false })
    setCustomers(data || [])
    setLoading(false)
  }

  const fetchCustomerBookings = async (customerId: string) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, services(name)')
      .eq('customer_id', customerId)
      .order('appointment_date', { ascending: false })
    setBookings(data || [])
  }

  const handleSelectCustomer = (customer: Customer) => {
    setSelected(customer)
    fetchCustomerBookings(customer.id)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-1">Manage</p>
        <h1 className="text-[#EEF4FF] font-serif text-4xl font-light">Customers</h1>
      </div>

      {loading ? (
        <p className="text-[#A09C97] text-xs tracking-widest uppercase">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Customer List */}
          <div className="lg:col-span-1 border border-[#EEF4FF]/10 overflow-hidden">
            <div className="bg-[#532332] px-4 py-3 border-b border-[#EEF4FF]/10">
              <p className="text-[#A09C97] text-xs tracking-widest uppercase">{customers.length} Customers</p>
            </div>
            <div className="divide-y divide-[#EEF4FF]/5 max-h-[600px] overflow-y-auto">
              {customers.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCustomer(c)}
                  className={`w-full px-4 py-3 text-left hover:bg-[#532332]/30 transition-colors ${
                    selected?.id === c.id ? 'bg-[#532332]/50' : ''
                  }`}
                >
                  <p className="text-[#EEF4FF] text-sm">{c.name}</p>
                  <p className="text-[#A09C97] text-xs">{c.phone}</p>
                  <p className="text-[#A09C97] text-xs">{c.bookings?.length || 0} bookings</p>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Detail */}
          <div className="lg:col-span-2 border border-[#EEF4FF]/10">
            {!selected ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-[#A09C97] text-xs tracking-widest uppercase">Select a customer</p>
              </div>
            ) : (
              <div>
                <div className="bg-[#532332] px-6 py-4 border-b border-[#EEF4FF]/10">
                  <h2 className="text-[#EEF4FF] font-serif text-2xl font-light">{selected.name}</h2>
                  <p className="text-[#A09C97] text-sm">{selected.phone}</p>
                  {selected.email && <p className="text-[#A09C97] text-sm">{selected.email}</p>}
                </div>
                <div className="p-6">
                  <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-4">Booking History</p>
                  <div className="space-y-3">
                    {bookings.length === 0 ? (
                      <p className="text-[#A09C97] text-sm">No bookings yet</p>
                    ) : bookings.map(b => (
                      <div key={b.id} className="flex justify-between items-center border border-[#EEF4FF]/10 px-4 py-3">
                        <div>
                          <p className="text-[#EEF4FF] text-sm">{b.services?.name}</p>
                          <p className="text-[#A09C97] text-xs">{b.appointment_date} at {b.start_time?.slice(0, 5)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#EEF4FF] text-sm">₹{b.reservation_amount}</p>
                          <span className={`text-xs tracking-widest uppercase ${
                            b.status === 'confirmed' ? 'text-green-400' :
                            b.status === 'cancelled' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}