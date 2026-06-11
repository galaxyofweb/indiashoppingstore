import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(2000).optional(),
  images: z.array(z.string()).max(5).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ success: false, error: 'Login required' }, { status: 401 })

    const body = await req.json()
    const data = reviewSchema.parse(body)
    const userId = (session.user as any).id

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: data.productId, userId } },
    })
    if (existing) return NextResponse.json({ success: false, error: 'You have already reviewed this product' }, { status: 400 })

    // Check verified purchase
    const purchaseExists = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: { userId, paymentStatus: 'PAID' },
      },
    })

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        images: data.images || [],
        isVerified: !!purchaseExists,
        status: 'PENDING',
      },
    })

    // Award loyalty points for review
    await prisma.loyaltyTransaction.create({
      data: {
        userId,
        points: 10,
        type: 'EARN_REVIEW',
        description: 'Points earned for writing a review',
      },
    })
    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: { increment: 10 } },
    })

    return NextResponse.json({ success: true, data: review })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const page = Number(searchParams.get('page')) || 1
    const limit = 10

    if (!productId) return NextResponse.json({ success: false, error: 'productId required' }, { status: 400 })

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId, status: 'APPROVED' },
        orderBy: [{ isVerified: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, image: true } } },
      }),
      prisma.review.count({ where: { productId, status: 'APPROVED' } }),
    ])

    return NextResponse.json({ success: true, data: { reviews, total, page, totalPages: Math.ceil(total / limit) } })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
