import Link from 'next/link'
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react'

interface SuccessPageProps {
  searchParams: { orderId?: string; orderNumber?: string }
}

export default function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, orderNumber } = searchParams

  return (
    <div className="container-tight py-16 text-center">
      <div className="max-w-lg mx-auto">
        {/* Animated checkmark */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
          <CheckCircle className="h-12 w-12 text-emerald-600" />
        </div>

        <h1 className="font-display text-4xl font-light text-primary mb-3">Order Placed!</h1>
        <p className="text-gray-500 text-lg mb-2">Thank you for shopping with us.</p>
        {orderNumber && (
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-5 py-2 text-sm font-semibold text-primary mb-8">
            <Package className="h-4 w-4" />
            Order #{orderNumber}
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8 text-left space-y-3">
          <p className="text-sm font-semibold text-emerald-800 mb-3">What happens next:</p>
          {[
            { icon: '📧', text: 'Confirmation email sent to your inbox' },
            { icon: '🔄', text: 'Order will be processed within 24 hours' },
            { icon: '📦', text: 'Packed and dispatched in 1–2 business days' },
            { icon: '🚚', text: 'Delivered in 3–5 business days' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-emerald-700">
              <span>{step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link href={`/account/orders/${orderId}`} className="btn-primary rounded-xl py-3 px-6">
              <Truck className="h-4 w-4" />
              Track Order
            </Link>
          )}
          <Link href="/shop" className="btn-outline rounded-xl py-3 px-6">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Loyalty point notification */}
        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 flex items-center gap-2 justify-center">
          🎁 You earned <strong>loyalty points</strong> on this order! Check your account.
        </div>
      </div>
    </div>
  )
}
