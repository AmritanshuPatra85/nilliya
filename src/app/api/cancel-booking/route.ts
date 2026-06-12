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
    const { bookingId, phone } = await req.json()

    // Fetch booking with payment
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, payments(*), customers(phone)')
      .eq('id', bookingId)
      .single()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Verify ownership
    if (booking.customers.phone !== phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
    }

    // Check 2hr window
    const appointmentDateTime = new Date(`${booking.appointment_date}T${booking.start_time}`)
    const now = new Date()
    const diffMs = appointmentDateTime.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 2) {
      return NextResponse.json({ error: 'Cannot cancel within 2 hours of appointment' }, { status: 400 })
    }

    // Process 70% refund via Razorpay
    const payment = booking.payments?.[0]
    if (payment?.razorpay_payment_id) {
      const refundAmount = Math.round(booking.reservation_amount * 0.7) * 100 // paise
      await razorpay.payments.refund(payment.razorpay_payment_id, {
        amount: refundAmount,
      })

      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', payment.id)
    }

    // Cancel booking
    await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    return NextResponse.json({ success: true, refunded: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 })
  }
}