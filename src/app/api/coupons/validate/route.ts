import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { code, orderAmount } = await req.json()

    if (!code) return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 })

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: true, data: { valid: false, error: 'Invalid coupon code' } })
    }

    const now = new Date()
    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json({ success: true, data: { valid: false, error: 'Coupon is not yet active' } })
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json({ success: true, data: { valid: false, error: 'Coupon has expired' } })
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: true, data: { valid: false, error: 'Coupon usage limit reached' } })
    }
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        success: true,
        data: { valid: false, error: `Minimum order amount of ₹${coupon.minOrderAmount} required` },
      })
    }

    // Check per-user limit
    if (session?.user && coupon.perUserLimit > 0) {
      const userUsage = await prisma.couponUsage.count({
        where: { couponId: coupon.id, userId: (session.user as any).id },
      })
      if (userUsage >= coupon.perUserLimit) {
        return NextResponse.json({ success: true, data: { valid: false, error: 'You have already used this coupon' } })
      }
    }

    // Calculate discount
    let discountAmount = 0
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * coupon.value) / 100
      if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount)
    } else if (coupon.type === 'FIXED') {
      discountAmount = Math.min(coupon.value, orderAmount)
    } else if (coupon.type === 'FREE_SHIPPING') {
      discountAmount = 49 // Standard shipping fee
    }

    discountAmount = parseFloat(discountAmount.toFixed(2))

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        discountAmount,
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          description: coupon.description,
        },
      },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
