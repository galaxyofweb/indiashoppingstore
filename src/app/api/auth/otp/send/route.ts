import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendOTPEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/cache/redis'

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { target, type } = await req.json()

    if (!target || !type) {
      return NextResponse.json({ success: false, error: 'target and type required' }, { status: 400 })
    }

    // Rate limit: 3 OTPs per 15 minutes
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const limit = await checkRateLimit(`otp:${target}:${ip}`, 3, 900)
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: 'Too many OTP requests. Please wait before trying again.' }, { status: 429 })
    }

    // Invalidate old OTPs
    await prisma.oTPCode.updateMany({
      where: { target, type, used: false },
      data: { used: true },
    })

    const otp = generateOTP()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.oTPCode.create({
      data: { target, code: otp, type, expires },
    })

    // Determine if email or phone
    const isEmail = target.includes('@')
    if (isEmail) {
      await sendOTPEmail(target, otp, type)
    } else {
      // SMS via Twilio (implement as needed)
      console.log(`SMS OTP for ${target}: ${otp}`) // Dev fallback
    }

    return NextResponse.json({ success: true, message: `OTP sent to ${isEmail ? 'email' : 'phone'}` })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
