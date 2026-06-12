import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { amount, name, phone, email, serviceId, variantId, date, startTime, duration } = await req.json()

    // Calculate end time
    const [h, m] = startTime.split(':').map(Number)
    const endMinutes = h * 60 + m + duration
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`

    // Upsert customer
    let customerId: string
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existing) {
      customerId = existing.id
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({ name, phone, email })
        .select('id')
        .single()
      customerId = newCustomer!.id
    }

    // Create booking
    const { data: booking } = await supabase
      .from('bookings')
      .insert({
        customer_id: customerId,
        service_id: serviceId,
        variant_id: variantId || null,
        appointment_date: date,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        reservation_amount: amount,
      })
      .select('id')
      .single()

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: booking!.id,
    })

    // Save payment record
    await supabase.from('payments').insert({
      booking_id: booking!.id,
      razorpay_order_id: order.id,
      amount,
      status: 'pending',
    })

    return NextResponse.json({ orderId: order.id, bookingId: booking!.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}