import Razorpay from 'razorpay'
import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export interface CreateRazorpayOrderParams {
  amount: number        // in paise (INR × 100)
  currency?: string
  receipt: string       // order id
  notes?: Record<string, string>
}

export async function createRazorpayOrder(params: CreateRazorpayOrderParams) {
  const order = await razorpay.orders.create({
    amount: Math.round(params.amount * 100), // Convert to paise
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes,
  })
  return order
}

export function verifyRazorpaySignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const body = params.orderId + '|' + params.paymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === params.signature
}

export function verifyRazorpayWebhook(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

export async function captureRazorpayPayment(paymentId: string, amount: number) {
  return razorpay.payments.capture(paymentId, Math.round(amount * 100), 'INR')
}

export async function createRazorpayRefund(paymentId: string, amount?: number) {
  return razorpay.payments.refund(paymentId, {
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  })
}

// ─── COD handling ───────────────────────────

export async function markCODOrder(orderId: string) {
  return prisma.payment.create({
    data: {
      orderId,
      provider: 'COD',
      amount: 0, // Will be updated on delivery
      status: 'PENDING',
      method: 'Cash on Delivery',
    },
  })
}
