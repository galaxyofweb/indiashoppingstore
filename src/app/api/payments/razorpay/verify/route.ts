import { NextRequest, NextResponse } from 'next/server'
import { verifyRazorpaySignature } from '@/lib/payments/razorpay'
import { prisma } from '@/lib/db/prisma'
import { sendShipmentEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json()

    // Verify signature
    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    })

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
    }

    // Update payment and order
    await prisma.payment.updateMany({
      where: { orderId, providerOrderId: razorpayOrderId },
      data: {
        providerPayId: razorpayPaymentId,
        status: 'PAID',
      },
    })

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentId: razorpayPaymentId,
      },
    })

    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'CONFIRMED',
        description: `Payment received via Razorpay (ID: ${razorpayPaymentId})`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
