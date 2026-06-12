'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [customers, setCustomers] = useState<{ name: string; phone: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [customerCount, setCustomerCount] = useState(0)

  useEffect(() => { fetchCustomers() }, [])

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('name, phone')
    setCustomers(data || [])
    setCustomerCount(data?.length || 0)
  }

  const handleBroadcast = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError('')
    setSent(false)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, customers }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
      setMessage('')
    } catch (e) {
      setError('Failed to send broadcast. Check WATI configuration.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#65222A] flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-1">WhatsApp</p>
          <h1 className="text-[#EEF4FF] font-serif text-4xl font-light">Broadcast</h1>
        </div>

        <div className="max-w-2xl">
          <div className="border border-[#EEF4FF]/10 bg-[#532332]/30 p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-1">Recipients</p>
              <p className="text-[#EEF4FF] font-serif text-3xl font-light">{customerCount}</p>
              <p className="text-[#A09C97] text-xs mt-1">Registered customers</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-[#EEF4FF]/20 flex items-center justify-center">
              <span className="text-[#EEF4FF] text-xl">✉</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[#A09C97] text-xs tracking-widest uppercase block mb-3">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message to all customers..."
              rows={6}
              className="w-full bg-[#532332]/30 border border-[#EEF4FF]/20 text-[#EEF4FF] px-4 py-3 focus:outline-none focus:border-[#EEF4FF]/60 placeholder:text-[#EEF4FF]/20 resize-none"
            />
            <p className="text-[#A09C97] text-xs mt-2">{message.length} characters</p>
          </div>

          {message && (
            <div className="border border-[#EEF4FF]/10 bg-[#532332]/20 p-5 mb-6">
              <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-3">Preview</p>
              <div className="bg-[#65222A] p-4 rounded-lg max-w-xs">
                <p className="text-[#EEF4FF] text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
              </div>
            </div>
          )}

          {sent && (
            <div className="border border-green-500/30 bg-green-900/20 px-4 py-3 mb-6">
              <p className="text-green-400 text-sm tracking-wide">✓ Broadcast sent to {customerCount} customers</p>
            </div>
          )}

          {error && (
            <div className="border border-red-500/30 bg-red-900/20 px-4 py-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleBroadcast}
            disabled={!message.trim() || loading || customerCount === 0}
            className="w-full bg-[#EEF4FF] text-[#532332] py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? `Sending to ${customerCount} customers...` : `Send to ${customerCount} Customers`}
          </button>
        </div>
      </div>
    </div>
  )
}