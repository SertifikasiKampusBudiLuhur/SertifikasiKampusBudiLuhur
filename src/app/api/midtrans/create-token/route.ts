import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOrderId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { registration_id } = body
    if (!registration_id) return NextResponse.json({ error: 'Missing registration_id' }, { status: 400 })

    const { data: reg, error: regError } = await supabase
      .from('registrations')
      .select('*, program:certification_programs(*), user:profiles!user_id(*)')
      .eq('id', registration_id)
      .eq('user_id', user.id)
      .single()

    if (regError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    const orderId = generateOrderId(registration_id)
    const grossAmount = reg.program.biaya

    const midtransRes = await fetch(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(process.env.MIDTRANS_SERVER_KEY! + ':').toString('base64')}`,
        },
        body: JSON.stringify({
          transaction_details: { order_id: orderId, gross_amount: grossAmount },
          customer_details: {
            first_name: reg.user.nama_lengkap,
            email: user.email,
            phone: reg.user.no_wa || '',
          },
          item_details: [{
            id: reg.program.id,
            price: grossAmount,
            quantity: 1,
            name: reg.program.nama.substring(0, 50),
          }],
          callbacks: {
            finish: `${process.env.NEXT_PUBLIC_APP_URL}/riwayat?payment=success`,
          },
        }),
      }
    )

    const midtransData = await midtransRes.json()

    if (!midtransRes.ok) {
      console.error('[create-token] Midtrans error:', midtransRes.status)
      return NextResponse.json({ error: 'Midtrans error' }, { status: 500 })
    }

    const { error: insertError } = await supabase.from('transactions').insert({
      registration_id,
      order_id: orderId,
      snap_token: midtransData.token,
      snap_redirect_url: midtransData.redirect_url,
      gross_amount: grossAmount,
    })

    if (insertError) {
      console.error('[create-token] Gagal insert transaksi:', insertError.message)
    }

    await supabase
      .from('registrations')
      .update({ status: 'PENDING_PAYMENT' })
      .eq('id', registration_id)

    return NextResponse.json({ snap_token: midtransData.token })

  } catch (err: any) {
    console.error('[create-token] Exception:', err?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
