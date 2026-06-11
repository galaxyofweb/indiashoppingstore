import { NextRequest, NextResponse } from 'next/server'
import { createRazorpayOrder } from '@/lib/payments/razorpay'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: 'orderId and amount required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })

    const rzpOrder = await createRazorpayOrder({
      amount,
      receipt: order.orderNumber,
      notes: { orderId, orderNumber: order.orderNumber },
    })

    // Save payment record
    await prisma.payment.create({
      data: {
        orderId,
        provider: 'RAZORPAY',
        providerOrderId: rzpOrder.id,
        amount,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
