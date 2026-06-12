'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Service = {
  id: string
  category: string
  name: string
  duration_minutes: number
  price_min: number
  price_max: number
  is_active: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Service | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    category: '',
    name: '',
    duration_minutes: 30,
    price_min: 0,
    price_max: 0,
    is_active: true,
  })

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('category')
    setServices(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (editing) {
      await supabase.from('services').update(form).eq('id', editing.id)
    } else {
      await supabase.from('services').insert(form)
    }
    setEditing(null)
    setAdding(false)
    setForm({ category: '', name: '', duration_minutes: 30, price_min: 0, price_max: 0, is_active: true })
    fetchServices()
  }

  const toggleActive = async (id: string, is_active: boolean) => {
    await supabase.from('services').update({ is_active: !is_active }).eq('id', id)
    fetchServices()
  }

  const startEdit = (service: Service) => {
    setEditing(service)
    setAdding(false)
    setForm({
      category: service.category,
      name: service.name,
      duration_minutes: service.duration_minutes,
      price_min: service.price_min,
      price_max: service.price_max,
      is_active: service.is_active,
    })
  }

  const grouped = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {} as Record<string, Service[]>)

  return (
    <div className="min-h-screen bg-[#65222A] flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-1">Manage</p>
            <h1 className="text-[#EEF4FF] font-serif text-4xl font-light">Services</h1>
          </div>
          <button
            onClick={() => { setAdding(true); setEditing(null) }}
            className="bg-[#EEF4FF] text-[#532332] px-6 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-white transition-all"
          >
            Add Service
          </button>
        </div>

        {(adding || editing) && (
          <div className="border border-[#EEF4FF]/20 bg-[#532332]/30 p-6 mb-8">
            <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-6">
              {editing ? 'Edit Service' : 'New Service'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Category', key: 'category', type: 'text' },
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Duration (min)', key: 'duration_minutes', type: 'number' },
                { label: 'Min Price (₹)', key: 'price_min', type: 'number' },
                { label: 'Max Price (₹)', key: 'price_max', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[#A09C97] text-xs tracking-widest uppercase block mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    value={(form as any)[field.key]}
                    onChange={e => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    className="w-full bg-[#65222A] border border-[#EEF4FF]/20 text-[#EEF4FF] px-3 py-2 text-sm focus:outline-none focus:border-[#EEF4FF]/60"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="bg-[#EEF4FF] text-[#532332] px-8 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-white transition-all">
                Save
              </button>
              <button onClick={() => { setEditing(null); setAdding(false) }} className="border border-[#EEF4FF]/20 text-[#EEF4FF] px-8 py-3 text-xs tracking-widest uppercase hover:border-[#EEF4FF]/50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-[#A09C97] text-xs tracking-widest uppercase">Loading...</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-[#A09C97] text-xs tracking-widest uppercase mb-3">{category}</p>
                <div className="border border-[#EEF4FF]/10 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEF4FF]/10 bg-[#532332]">
                        {['Name', 'Duration', 'Price Range', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[#A09C97] text-xs tracking-widest uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(s => (
                        <tr key={s.id} className="border-b border-[#EEF4FF]/5 hover:bg-[#532332]/30 transition-colors">
                          <td className="px-4 py-3 text-[#EEF4FF] text-sm">{s.name}</td>
                          <td className="px-4 py-3 text-[#EEF4FF] text-sm">{s.duration_minutes} min</td>
                          <td className="px-4 py-3 text-[#EEF4FF] text-sm">
                            {s.price_min === s.price_max ? `₹${s.price_min}` : `₹${s.price_min} – ₹${s.price_max}`}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs tracking-widest uppercase px-2 py-1 ${s.is_active ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                              {s.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-3">
                              <button onClick={() => startEdit(s)} className="text-xs text-[#A09C97] hover:text-[#EEF4FF] tracking-widest uppercase transition-colors">
                                Edit
                              </button>
                              <button onClick={() => toggleActive(s.id, s.is_active)} className={`text-xs tracking-widest uppercase transition-colors ${s.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}>
                                {s.is_active ? 'Disable' : 'Enable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}