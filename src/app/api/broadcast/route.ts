import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, customers } = await req.json()

    const results = await Promise.allSettled(
      customers.map(async (customer: { name: string; phone: string }) => {
        const phone = customer.phone.replace(/\D/g, '')
        const formattedPhone = phone.startsWith('91') ? phone : `91${phone}`

        const res = await fetch(`${process.env.WATI_API_ENDPOINT}/api/v1/sendSessionMessage/${formattedPhone}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WATI_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messageText: message }),
        })

        return res.ok
      })
    )

    const succeeded = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ success: true, sent: succeeded, total: customers.length })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Broadcast failed' }, { status: 500 })
  }
}