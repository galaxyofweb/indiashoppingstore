import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db/prisma'
import { formatINR } from '@/utils/gst'
import { Package, ChevronRight, Truck } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING:          { label: 'Pending',           color: 'bg-yellow-100 text-yellow-800',  icon: '⏳' },
  CONFIRMED:        { label: 'Confirmed',          color: 'bg-blue-100 text-blue-800',      icon: '✓' },
  PROCESSING:       { label: 'Processing',         color: 'bg-indigo-100 text-indigo-800',  icon: '⚙️' },
  SHIPPED:          { label: 'Shipped',            color: 'bg-cyan-100 text-cyan-800',      icon: '📦' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   color: 'bg-orange-100 text-orange-800',  icon: '🚚' },
  DELIVERED:        { label: 'Delivered',          color: 'bg-emerald-100 text-emerald-800', icon: '✅' },
  CANCELLED:        { label: 'Cancelled',          color: 'bg-red-100 text-red-800',        icon: '✗' },
  RETURN_REQUESTED: { label: 'Return Requested',   color: 'bg-orange-100 text-orange-800',  icon: '↩' },
  RETURNED:         { label: 'Returned',           color: 'bg-gray-100 text-gray-600',      icon: '↩' },
  REFUNDED:         { label: 'Refunded',           color: 'bg-emerald-100 text-emerald-800', icon: '💰' },
}

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login?callbackUrl=/account/orders')

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      items: {
        take: 3,
        select: { name: true, image: true, quantity: true, price: true, total: true },
      },
    },
  })

  return (
    <div className="container-full py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold text-primary">My Orders</h1>
        <span className="ml-auto text-sm text-gray-400">{orders.length} orders</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
          <Link href="/shop" className="btn-primary rounded-lg">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const status = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600', icon: '•' }
            return (
              <div key={order.id} className="card p-5 hover:shadow-product-hover transition-shadow">
                {/* Order Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-primary">#{order.orderNumber}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-primary text-lg">{formatINR(order.total)}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2 border-t border-gray-50 pt-4">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                      <span className="flex-1 text-gray-700 truncate">{item.name}</span>
                      <span className="text-gray-400 shrink-0">×{item.quantity}</span>
                      <span className="font-medium text-gray-900 shrink-0">{formatINR(item.total)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                  <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    View Details <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                  {order.trackingNumber && (
                    <a href={order.trackingUrl || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline ml-auto">
                      <Truck className="h-3.5 w-3.5" /> Track Shipment
                    </a>
                  )}
                  {order.status === 'DELIVERED' && (
                    <Link href={`/account/orders/${order.id}/return`} className="text-sm text-gray-500 hover:text-primary transition-colors ml-auto">
                      Return / Exchange
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
