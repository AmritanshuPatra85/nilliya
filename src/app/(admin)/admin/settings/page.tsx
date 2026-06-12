'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function BookingSettingsPage() {
  const [windowDays, setWindowDays] = useState(5)
  const [maxPerSlot, setMaxPerSlot] = useState(1)
  const [closedDates, setClosedDates] = useState<string[]>([])
  const [newDate, setNewDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('booking_settings')
        .select('*')
        .eq('id', 1)
        .single()
      if (data) {
        setWindowDays(data.booking_window_days)
        setMaxPerSlot(data.max_bookings_per_slot)
        setClosedDates(data.closed_dates || [])
      }
    }
    fetch()
  }, [])

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('booking_settings')
      .update({
        booking_window_days: windowDays,
        max_bookings_per_slot: maxPerSlot,
        closed_dates: closedDates,
      })
      .eq('id', 1)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addClosedDate = () => {
    if (!newDate || closedDates.includes(newDate)) return
    setClosedDates([...closedDates, newDate].sort())
    setNewDate('')
  }

  const removeClosedDate = (date: string) => {
    setClosedDates(closedDates.filter(d => d !== date))
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Booking Settings</h1>

      <div className="space-y-8">

        {/* Booking Window */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Booking Window (days in advance)
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={windowDays}
            onChange={e => setWindowDays(Number(e.target.value))}
            className="w-32 border rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Customers can book up to {windowDays} days in advance.
          </p>
        </div>

        {/* Max bookings per slot */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Bookings Per Slot
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxPerSlot}
            onChange={e => setMaxPerSlot(Number(e.target.value))}
            className="w-32 border rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            How many bookings allowed per time slot.
          </p>
        </div>

        {/* Closed Dates */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Closed Dates
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm"
            />
            <button
              onClick={addClosedDate}
              className="bg-gray-900 text-white px-4 py-2 text-sm rounded hover:bg-gray-700"
            >
              Add
            </button>
          </div>
          {closedDates.length === 0 ? (
            <p className="text-xs text-gray-500">No closed dates set.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {closedDates.map(date => (
                <div
                  key={date}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-1 text-sm"
                >
                  <span>{date}</span>
                  <button
                    onClick={() => removeClosedDate(date)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-3 text-sm rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>

      </div>
    </div>
  )
}