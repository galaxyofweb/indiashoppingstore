import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { sendWelcomeEmail } from '@/lib/email'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
})

function generateReferralCode(name: string): string {
  const base = name.replace(/\s+/g, '').toUpperCase().slice(0, 5)
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${base}${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json({ success: false, error: 'An account with this email already exists' }, { status: 400 })

    // Check duplicate phone
    if (data.phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: data.phone } })
      if (existingPhone) return NextResponse.json({ success: false, error: 'Mobile number already registered' }, { status: 400 })
    }

    // Validate referral code
    let referredBy: string | undefined
    if (data.referralCode) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referralCode } })
      if (referrer) {
        referredBy = referrer.id
        // Award referrer bonus points
        await prisma.user.update({ where: { id: referrer.id }, data: { loyaltyPoints: { increment: 100 } } })
        await prisma.loyaltyTransaction.create({
          data: { userId: referrer.id, points: 100, type: 'EARN_REFERRAL', description: `Referral bonus — ${data.name} joined` },
        })
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12)
    const referralCode = generateReferralCode(data.name)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        referralCode,
        referredBy,
        loyaltyPoints: 50,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    })

    // Welcome bonus points transaction
    await prisma.loyaltyTransaction.create({
      data: { userId: user.id, points: 50, type: 'EARN_SIGNUP', description: 'Welcome bonus points' },
    })

    // Welcome email (async)
    sendWelcomeEmail({ email: data.email, name: data.name }).catch(() => {})

    return NextResponse.json({ success: true, data: { userId: user.id } }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
