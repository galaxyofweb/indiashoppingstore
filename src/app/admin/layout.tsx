import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth/options'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  BarChart2, Settings, FileText, MessageSquare, Truck,
  LogOut, Bell, Star,
} from 'lucide-react'

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/admin/blog', icon: FileText, label: 'Blog' },
  { href: '/admin/banners', icon: MessageSquare, label: 'Banners' },
  { href: '/admin/shipping', icon: Truck, label: 'Shipping' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes((session.user as any).role)) {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-primary flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/admin" className="font-display text-lg font-light tracking-widest text-white">
            INDIA<span className="text-gold">SHOPPING</span>
          </Link>
          <p className="text-2xs text-white/40 mt-0.5 uppercase tracking-widest">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors group">
              <Icon className="h-4 w-4 shrink-0 group-hover:text-gold transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold text-primary-950 flex items-center justify-center text-xs font-bold">
              {session.user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{session.user.name}</p>
              <p className="text-2xs text-white/40 truncate">{(session.user as any).role}</p>
            </div>
          </div>
          <Link href="/api/auth/signout"
            className="flex items-center gap-2 text-xs text-white/50 hover:text-red-400 transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="text-xs text-gray-500 hover:text-primary transition-colors">
              View Store ↗
            </Link>
            <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
