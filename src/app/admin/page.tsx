import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/options'
import { prisma } from '@/lib/db/prisma'
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import { formatINR } from '@/utils/gst'

export const metadata: Metadata = { title: 'Admin Dashboard — IndiaShoppingStore' }

async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    revenueThisMonth, revenueLastMonth,
    ordersThisMonth, ordersLastMonth,
    totalCustomers, newCustomers,
    totalProducts, lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startOfMonth } } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { status: 'ACTIVE', stock: { lte: 10, gt: 0 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { address: true, items: { take: 1 } },
    }),
  ])

  return {
    revenue: {
      current: revenueThisMonth._sum.total || 0,
      previous: revenueLastMonth._sum.total || 0,
    },
    orders: { current: ordersThisMonth, previous: ordersLastMonth },
    customers: { total: totalCustomers, new: newCustomers },
    products: { total: totalProducts, lowStock: lowStockProducts },
    recentOrders,
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    redirect('/')
  }

  const stats = await getDashboardStats()

  const revChange = stats.revenue.previous > 0
    ? ((stats.revenue.current - stats.revenue.previous) / stats.revenue.previous) * 100
    : 0
  const ordChange = stats.orders.previous > 0
    ? ((stats.orders.current - stats.orders.previous) / stats.orders.previous) * 100
    : 0

  const STAT_CARDS = [
    {
      label: 'Revenue (This Month)',
      value: formatINR(stats.revenue.current),
      change: revChange,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Orders (This Month)',
      value: stats.orders.current.toLocaleString('en-IN'),
      change: ordChange,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Customers',
      value: stats.customers.total.toLocaleString('en-IN'),
      sub: `+${stats.customers.new} this month`,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Active Products',
      value: stats.products.total.toLocaleString('en-IN'),
      sub: stats.products.lowStock > 0 ? `⚠ ${stats.products.lowStock} low stock` : 'All stocked',
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-cyan-100 text-cyan-800',
    DELIVERED: 'bg-emerald-100 text-emerald-800',
    CANCELLED: 'bg-red-100 text-red-800',
    RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Welcome back, {session.user.name?.split(' ')[0]} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-3">
          <a href="/admin/products/new" className="btn-gold rounded-lg text-sm">
            + Add Product
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              {card.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${card.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {card.change >= 0
                    ? <ArrowUpRight className="h-3.5 w-3.5" />
                    : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {Math.abs(card.change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-primary mt-3">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub || card.label}</p>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {stats.products.lowStock > 0 && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 mb-6 text-sm text-orange-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>{stats.products.lowStock} products</strong> are running low on stock.</span>
          <a href="/admin/products?filter=lowstock" className="ml-auto underline font-medium">View all</a>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-primary">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-primary hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-primary">{order.orderNumber}</td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {order.address.firstName} {order.address.lastName}
                    <p className="text-xs text-gray-400">{order.address.city}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td className="px-5 py-3.5 font-semibold text-primary">{formatINR(order.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-2xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <a href={`/admin/orders/${order.id}`} className="text-primary text-xs font-medium hover:underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
