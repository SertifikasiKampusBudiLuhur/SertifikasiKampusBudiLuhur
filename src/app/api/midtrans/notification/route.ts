import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

/**
 * POST /api/midtrans/notification
 * Endpoint webhook dari Midtrans — bypass auth middleware
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
      settlement_time,
    } = body

    // Verifikasi signature dari Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY!
    const expectedSignature = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (signature_key !== expectedSignature) {
      console.error('Invalid Midtrans signature for order:', order_id)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Gunakan service client (bypass RLS) untuk update dari webhook
    const supabase = createServiceClient()

    // Cari transaksi berdasarkan order_id
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id, registration_id')
      .eq('order_id', order_id)
      .single()

    if (!transaction) {
      console.error('[webhook] Transaction not found for order_id:', order_id)
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    // Tentukan status baru berdasarkan status Midtrans
    const isPaid =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement'

    const isExpired = transaction_status === 'expire' || transaction_status === 'cancel'

    // Update transaksi
    await supabase.from('transactions').update({
      midtrans_status: transaction_status,
      payment_type,
      transaction_id,
      paid_at: isPaid ? settlement_time : null,
    }).eq('id', transaction.id)

    // Update status registrasi
    if (isPaid) {
      await supabase
        .from('registrations')
        .update({ status: 'PAID' })
        .eq('id', transaction.registration_id)

      // Tambah kuota_terisi pada program
      // Ambil program_id dulu
      const { data: reg } = await supabase
        .from('registrations')
        .select('program_id')
        .eq('id', transaction.registration_id)
        .single()

      if (reg) {
        await supabase.rpc('increment_kuota_terisi', { program_id: reg.program_id })
      }
    } else if (isExpired) {
      await supabase
        .from('registrations')
        .update({ status: 'DRAFT' })
        .eq('id', transaction.registration_id)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
