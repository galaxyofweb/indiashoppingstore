'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, CreditCard, Smartphone, Truck, Tag, ChevronRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore } from '@/store'
import { formatINR, calculateGST } from '@/utils/gst'
import { cn } from '@/utils/cn'

const addressSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email'),
  line1: z.string().min(5, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode required'),
  landmark: z.string().optional(),
})

type AddressForm = z.infer<typeof addressSchema>

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
]

type PaymentMethod = 'RAZORPAY' | 'UPI' | 'COD' | 'STRIPE'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, subtotal, clearCart } = useCartStore()

  const [step, setStep] = useState<'address' | 'payment'>('address')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY')
  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [placing, setPlacing] = useState(false)
  const [addressData, setAddressData] = useState<AddressForm | null>(null)

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      email: session?.user?.email || '',
    },
  })

  // Pricing
  const shippingFee = subtotal >= 499 ? 0 : 49
  const couponDiscount = appliedCoupon?.discount || 0
  const taxableAmount = subtotal - couponDiscount
  const gstAmount = parseFloat((taxableAmount * 0.18 / 1.18).toFixed(2))
  const total = subtotal + shippingFee - couponDiscount

  const handleAddressSubmit = (data: AddressForm) => {
    setAddressData(data)
    setStep('payment')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return
    try {
      const res = await fetch(`/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.trim().toUpperCase(), orderAmount: subtotal }),
      })
      const data = await res.json()
      if (data.success && data.data.valid) {
        setAppliedCoupon({ code: coupon.toUpperCase(), discount: data.data.discountAmount })
        toast.success(`Coupon applied! You saved ${formatINR(data.data.discountAmount)}`)
      } else {
        toast.error(data.data.error || 'Invalid coupon code')
      }
    } catch {
      toast.error('Failed to apply coupon')
    }
  }

  const handlePlaceOrder = async () => {
    if (!addressData) return
    setPlacing(true)

    try {
      // 1. Create order in DB
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            variantId: i.variant?.id,
            quantity: i.quantity,
            price: i.price,
          })),
          address: addressData,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          subtotal,
          shippingFee,
          couponDiscount,
          total,
        }),
      })
      const orderData = await orderRes.json()
      if (!orderData.success) throw new Error(orderData.error)

      const { orderId, orderNumber } = orderData.data

      if (paymentMethod === 'COD') {
        clearCart()
        router.push(`/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}`)
        return
      }

      if (paymentMethod === 'RAZORPAY') {
        // 2. Create Razorpay order
        const rpRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, amount: total }),
        })
        const rpData = await rpRes.json()
        if (!rpData.success) throw new Error(rpData.error)

        // 3. Open Razorpay checkout
        const Razorpay = (window as any).Razorpay
        const rzp = new Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rpData.data.amount,
          currency: 'INR',
          name: 'IndiaShoppingStore',
          description: `Order #${orderNumber}`,
          order_id: rpData.data.razorpayOrderId,
          prefill: {
            name: `${addressData.firstName} ${addressData.lastName}`,
            email: addressData.email,
            contact: addressData.phone,
          },
          theme: { color: '#1a1a2e' },
          handler: async (response: any) => {
            // 4. Verify payment
            const verifyRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              clearCart()
              router.push(`/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}`)
            } else {
              toast.error('Payment verification failed. Contact support.')
            }
          },
        })
        rzp.open()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-tight py-24 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold text-primary mb-3">Your cart is empty</h2>
        <Link href="/shop" className="btn-primary rounded-lg">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <>
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-full max-w-6xl">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cart" className="btn-ghost p-2 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-primary">Checkout</h1>
              <div className="flex items-center gap-2 mt-1">
                {['Address', 'Payment'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                      (step === 'address' && i === 0) || (step === 'payment' && i <= 1)
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    )}>
                      {i + 1}
                    </div>
                    <span className={cn('text-sm', step === s.toLowerCase() ? 'font-semibold text-primary' : 'text-gray-400')}>
                      {s}
                    </span>
                    {i < 1 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left — Form */}
            <div className="lg:col-span-2 space-y-5">

              {/* Step 1: Address */}
              {step === 'address' && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-primary mb-6">Delivery Address</h2>
                  <form onSubmit={form.handleSubmit(handleAddressSubmit)} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
                      <input {...form.register('firstName')} className="input" placeholder="Rahul" />
                      {form.formState.errors.firstName && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
                      <input {...form.register('lastName')} className="input" placeholder="Sharma" />
                      {form.formState.errors.lastName && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                      <input {...form.register('phone')} className="input" placeholder="9876543210" type="tel" />
                      {form.formState.errors.phone && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <input {...form.register('email')} className="input" placeholder="rahul@email.com" type="email" />
                      {form.formState.errors.email && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                      <input {...form.register('line1')} className="input" placeholder="House/Flat No., Street Name" />
                      {form.formState.errors.line1 && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.line1.message}</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                      <input {...form.register('line2')} className="input" placeholder="Apartment, floor, area (optional)" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                      <input {...form.register('city')} className="input" placeholder="New Delhi" />
                      {form.formState.errors.city && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                      <select {...form.register('state')} className="input">
                        <option value="">Select State</option>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {form.formState.errors.state && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.state.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                      <input {...form.register('pincode')} className="input" placeholder="110001" maxLength={6} />
                      {form.formState.errors.pincode && (
                        <p className="text-xs text-red-500 mt-1">{form.formState.errors.pincode.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Landmark</label>
                      <input {...form.register('landmark')} className="input" placeholder="Near Metro Station (optional)" />
                    </div>
                    <div className="col-span-2 pt-2">
                      <button type="submit" className="btn-gold rounded-xl w-full py-4 text-base font-semibold justify-center">
                        Continue to Payment
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 2: Payment */}
              {step === 'payment' && (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-primary">Payment Method</h2>
                    <button onClick={() => setStep('address')} className="text-sm text-primary hover:underline">
                      ← Edit Address
                    </button>
                  </div>

                  {/* Address summary */}
                  {addressData && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
                      <p className="font-semibold text-primary">{addressData.firstName} {addressData.lastName}</p>
                      <p>{addressData.line1}{addressData.line2 ? `, ${addressData.line2}` : ''}</p>
                      <p>{addressData.city}, {addressData.state} – {addressData.pincode}</p>
                      <p>{addressData.phone} · {addressData.email}</p>
                    </div>
                  )}

                  {/* Payment options */}
                  <div className="space-y-3">
                    {[
                      { id: 'RAZORPAY' as const, icon: CreditCard, label: 'Cards / Net Banking / Wallets', sub: 'Powered by Razorpay — India\'s trusted payment gateway', badge: 'Recommended' },
                      { id: 'UPI' as const, icon: Smartphone, label: 'UPI', sub: 'Pay using GPay, PhonePe, Paytm, BHIM UPI', badge: null },
                      { id: 'COD' as const, icon: Truck, label: 'Cash on Delivery', sub: 'Pay when your order arrives (₹39 COD fee)', badge: null },
                    ].map(({ id, icon: Icon, label, sub, badge }) => (
                      <label
                        key={id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                          paymentMethod === id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={id}
                          checked={paymentMethod === id}
                          onChange={() => setPaymentMethod(id)}
                          className="sr-only"
                        />
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                          paymentMethod === id ? 'border-primary' : 'border-gray-300'
                        )}>
                          {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <Icon className={cn('h-5 w-5 shrink-0', paymentMethod === id ? 'text-primary' : 'text-gray-400')} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{label}</span>
                            {badge && (
                              <span className="text-2xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">{badge}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Trust note */}
                  <div className="flex items-center gap-2 mt-5 text-xs text-gray-400">
                    <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    Your payment information is encrypted with 256-bit SSL
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="btn-gold rounded-xl w-full py-4 text-base font-semibold justify-center mt-6"
                  >
                    {placing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-950 border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Place Order — {formatINR(total)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right — Order Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Apply Coupon
                </h3>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-emerald-700">{appliedCoupon.code}</p>
                      <p className="text-xs text-emerald-600">You save {formatINR(appliedCoupon.discount)}</p>
                    </div>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="input flex-1 py-2.5 text-sm uppercase font-mono"
                    />
                    <button onClick={handleApplyCoupon} className="btn-outline rounded-lg px-4 text-sm">
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        <Image
                          src={item.product.thumbnail || item.product.images[0] || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-2xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 clamp-2 leading-snug">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-2xs text-gray-400 mt-0.5">
                            {Object.entries(item.variant.attributes).map(([k,v]) => `${v}`).join(' / ')}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  {[
                    { label: 'Subtotal', value: formatINR(subtotal) },
                    { label: 'Shipping', value: shippingFee === 0 ? 'FREE' : formatINR(shippingFee), green: shippingFee === 0 },
                    ...(couponDiscount > 0 ? [{ label: `Coupon (${appliedCoupon?.code})`, value: `–${formatINR(couponDiscount)}`, green: true }] : []),
                    { label: 'GST (est.)', value: formatINR(gstAmount), small: true },
                  ].map(({ label, value, green, small }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className={cn('text-gray-500', small && 'text-xs')}>{label}</span>
                      <span className={cn('font-medium', green ? 'text-emerald-600' : 'text-gray-900', small && 'text-xs')}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold text-primary border-t border-gray-200 pt-3 mt-1">
                    <span>Total</span>
                    <span className="font-mono">{formatINR(total)}</span>
                  </div>
                </div>
              </div>

              {/* Secure badges */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  Secure 256-bit SSL Checkout
                </div>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  {['UPI', 'Razorpay', 'Visa', 'Mastercard', 'COD'].map((p) => (
                    <span key={p} className="text-2xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
