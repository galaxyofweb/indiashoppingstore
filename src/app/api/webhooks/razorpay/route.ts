import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpayWebhook } from '@/lib/payments/razorpay'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature') || ''

    if (!verifyRazorpayWebhook(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const { event: eventType, payload } = event

    switch (eventType) {
      case 'payment.captured': {
        const payment = payload.payment.entity
        await prisma.payment.updateMany({
          where: { providerPayId: payment.id },
          data: { status: 'PAID' },
        })
        // Find order and update
        const dbPayment = await prisma.payment.findFirst({
          where: { providerPayId: payment.id },
        })
        if (dbPayment) {
          await prisma.order.update({
            where: { id: dbPayment.orderId },
            data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
          })
        }
        break
      }

      case 'payment.failed': {
        const payment = payload.payment.entity
        await prisma.payment.updateMany({
          where: { providerOrderId: payment.order_id },
          data: { status: 'FAILED' },
        })
        const dbPayment = await prisma.payment.findFirst({
          where: { providerOrderId: payment.order_id },
        })
        if (dbPayment) {
          await prisma.order.update({
            where: { id: dbPayment.orderId },
            data: { paymentStatus: 'FAILED' },
          })
        }
        break
      }

      case 'refund.processed': {
        const refund = payload.refund.entity
        await prisma.payment.updateMany({
          where: { providerPayId: refund.payment_id },
          data: { status: 'REFUNDED' },
        })
        break
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err: any) {
    console.error('[Razorpay Webhook Error]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
