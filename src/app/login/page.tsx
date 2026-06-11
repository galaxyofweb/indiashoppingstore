'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/utils/cn'

type LoginMode = 'email' | 'otp'

const emailSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type EmailForm = z.infer<typeof emailSchema>

const otpSchema = z.object({
  target: z.string().min(6, 'Enter email or 10-digit mobile'),
  otp: z.string().length(6, '6-digit OTP required').optional(),
})
type OTPForm = z.infer<typeof otpSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [mode, setMode] = useState<LoginMode>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const otpForm = useForm<OTPForm>({ resolver: zodResolver(otpSchema) })

  const handleEmailLogin = async (data: EmailForm) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error)
      } else {
        toast.success('Welcome back!')
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    const target = otpForm.getValues('target')
    if (!target) { toast.error('Enter your email or phone'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type: 'LOGIN' }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
        toast.success(data.message)
      } else {
        toast.error(data.error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)
    await signIn(provider, { callbackUrl })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-light tracking-[0.1em] text-primary">
              INDIA<span className="text-gold">SHOPPING</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
        </div>

        <div className="card p-8">
          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
            {[
              { id: 'email' as const, label: 'Email & Password', icon: Mail },
              { id: 'otp' as const, label: 'OTP Login', icon: Smartphone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setMode(id); setOtpSent(false) }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                  mode === id ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Email + Password Form */}
          {mode === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...emailForm.register('email')}
                    type="email"
                    className="input pl-10"
                    placeholder="you@example.com"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...emailForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {emailForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">{emailForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-xl py-3.5 justify-center"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {mode === 'otp' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Mobile Number</label>
                <input
                  {...otpForm.register('target')}
                  className="input"
                  placeholder="email@example.com or 9876543210"
                  disabled={otpSent}
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="btn-primary w-full rounded-xl py-3.5 justify-center"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                    <input
                      {...otpForm.register('otp')}
                      className="input text-center text-2xl font-mono tracking-[0.5em]"
                      placeholder="000000"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-400 mt-1">OTP expires in 10 minutes</p>
                  </div>
                  <button className="btn-primary w-full rounded-xl py-3.5 justify-center">
                    Verify & Sign In <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    Change email/phone
                  </button>
                </>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="divider-text my-6 text-xs">OR CONTINUE WITH</div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { provider: 'google', label: 'Google', emoji: '🇬' },
              { provider: 'facebook', label: 'Facebook', emoji: 'f' },
            ].map(({ provider, label, emoji }) => (
              <button
                key={provider}
                onClick={() => handleSocialLogin(provider)}
                disabled={!!socialLoading}
                className="btn-outline rounded-xl py-3 justify-center text-sm font-medium"
              >
                {socialLoading === provider
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><span className="text-base">{emoji}</span> {label}</>}
              </button>
            ))}
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-4">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="hover:text-primary">Terms</Link> &{' '}
          <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
