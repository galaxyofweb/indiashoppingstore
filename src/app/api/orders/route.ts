import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db/prisma'
import { sendOrderConfirmationEmail } from '@/lib/email'

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ISS-${ts}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const {
      items, address, paymentMethod, couponCode,
      subtotal, shippingFee, couponDiscount, total,
    } = body

    // Validate items
    if (!items?.length) return NextResponse.json({ success: false, error: 'No items in order' }, { status: 400 })
    if (!address) return NextResponse.json({ success: false, error: 'Address required' }, { status: 400 })

    // Verify product prices and stock
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: { variants: true },
    })

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ success: false, error: `Product ${item.productId} not found` }, { status: 400 })

      const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null
      const availableStock = variant ? variant.stock : product.stock
      if (availableStock < item.quantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }
    }

    // Create or find address
    let addressRecord: any

    if (session?.user) {
      addressRecord = await prisma.address.create({
        data: {
          userId: (session.user as any).id,
          type: 'SHIPPING',
          isDefault: false,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: 'India',
          landmark: address.landmark,
        },
      })
    } else {
      // Guest order - create address without userId
      addressRecord = await prisma.address.create({
        data: {
          type: 'SHIPPING',
          isDefault: false,
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: 'India',
          landmark: address.landmark,
        },
      })
    }

    const orderNumber = generateOrderNumber()

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: (session?.user as any)?.id || null,
        addressId: addressRecord.id,
        status: 'PENDING',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
        paymentMethod,
        subtotal,
        discount: 0,
        shipping: shippingFee,
        tax: parseFloat((subtotal * 0.18 / 1.18).toFixed(2)),
        total,
        couponCode,
        couponDiscount: couponDiscount || 0,
        ip: req.headers.get('x-forwarded-for') || req.ip,
        items: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.productId)!
            const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : null
            return {
              productId: item.productId,
              variantId: item.variantId || null,
              name: product.name,
              image: product.thumbnail || product.images[0] || null,
              sku: variant?.sku || product.sku,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              gstRate: product.gstRate,
              gstAmount: parseFloat(((item.price * item.quantity) * product.gstRate / (100 + product.gstRate)).toFixed(2)),
            }
          }),
        },
      },
    })

    // COD payment record
    if (paymentMethod === 'COD') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: 'COD',
          amount: total,
          status: 'PENDING',
          method: 'Cash on Delivery',
        },
      })

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED' },
      })
    }

    // Decrease stock
    for (const item of items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        })
      }
    }

    // Award loyalty points (1 point per ₹10)
    if (session?.user) {
      const pointsEarned = Math.floor(total / 10)
      if (pointsEarned > 0) {
        await prisma.loyaltyTransaction.create({
          data: {
            userId: (session.user as any).id,
            points: pointsEarned,
            type: 'EARN_ORDER',
            description: `Points earned on order #${orderNumber}`,
            orderId: order.id,
          },
        })
        await prisma.user.update({
          where: { id: (session.user as any).id },
          data: { loyaltyPoints: { increment: pointsEarned } },
        })
      }
    }

    // Add to order timeline
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
        description: paymentMethod === 'COD' ? 'Order confirmed — Cash on Delivery' : 'Order placed, awaiting payment',
      },
    })

    // Send confirmation email (async, don't block)
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, address: true },
    })
    if (address.email && fullOrder) {
      sendOrderConfirmationEmail(fullOrder, address.email).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber },
    })
  } catch (err: any) {
    console.error('[Orders API Error]', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to create order' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = 10
    const userId = (session.user as any).id

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { take: 3 },
          address: true,
        },
      }),
      prisma.order.count({ where: { userId } }),
    ])

    return NextResponse.json({
      success: true,
      data: { orders, total, page, totalPages: Math.ceil(total / limit) },
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
