'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  Bell,
  Package,
  LogOut,
  Settings,
  Gift,
} from 'lucide-react'
import { useCartStore, useUIStore } from '@/store'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  {
    label: 'Women',
    href: '/shop/women',
    featured: { image: '/images/nav/women.jpg', text: 'New Season Arrivals' },
    columns: [
      {
        title: 'Clothing',
        links: [
          { label: 'Kurtas & Suits', href: '/shop/women/kurtas' },
          { label: 'Sarees', href: '/shop/women/sarees' },
          { label: 'Western Wear', href: '/shop/women/western' },
          { label: 'Activewear', href: '/shop/women/activewear' },
          { label: 'Ethnic Wear', href: '/shop/women/ethnic' },
        ],
      },
      {
        title: 'Accessories',
        links: [
          { label: 'Handbags', href: '/shop/women/handbags' },
          { label: 'Jewellery', href: '/shop/women/jewellery' },
          { label: 'Footwear', href: '/shop/women/footwear' },
          { label: 'Sunglasses', href: '/shop/women/sunglasses' },
        ],
      },
    ],
  },
  {
    label: 'Men',
    href: '/shop/men',
    featured: { image: '/images/nav/men.jpg', text: 'Premium Essentials' },
    columns: [
      {
        title: 'Clothing',
        links: [
          { label: 'Shirts', href: '/shop/men/shirts' },
          { label: 'Trousers', href: '/shop/men/trousers' },
          { label: 'Ethnic Wear', href: '/shop/men/ethnic' },
          { label: 'Activewear', href: '/shop/men/activewear' },
          { label: 'Outerwear', href: '/shop/men/outerwear' },
        ],
      },
      {
        title: 'Accessories',
        links: [
          { label: 'Footwear', href: '/shop/men/footwear' },
          { label: 'Watches', href: '/shop/men/watches' },
          { label: 'Bags', href: '/shop/men/bags' },
          { label: 'Belts & Wallets', href: '/shop/men/belts' },
        ],
      },
    ],
  },
  {
    label: 'Electronics',
    href: '/shop/electronics',
    columns: [
      {
        title: 'Devices',
        links: [
          { label: 'Smartphones', href: '/shop/electronics/smartphones' },
          { label: 'Laptops', href: '/shop/electronics/laptops' },
          { label: 'Tablets', href: '/shop/electronics/tablets' },
          { label: 'Smart Watches', href: '/shop/electronics/smartwatches' },
        ],
      },
      {
        title: 'Accessories',
        links: [
          { label: 'Audio', href: '/shop/electronics/audio' },
          { label: 'Cameras', href: '/shop/electronics/cameras' },
          { label: 'Gaming', href: '/shop/electronics/gaming' },
          { label: 'Smart Home', href: '/shop/electronics/smarthome' },
        ],
      },
    ],
  },
  {
    label: 'Home & Living',
    href: '/shop/home',
    columns: [
      {
        title: 'Home',
        links: [
          { label: 'Furniture', href: '/shop/home/furniture' },
          { label: 'Decor', href: '/shop/home/decor' },
          { label: 'Kitchen', href: '/shop/home/kitchen' },
          { label: 'Bedding', href: '/shop/home/bedding' },
        ],
      },
      {
        title: 'Living',
        links: [
          { label: 'Lighting', href: '/shop/home/lighting' },
          { label: 'Plants & Pots', href: '/shop/home/plants' },
          { label: 'Bath', href: '/shop/home/bath' },
          { label: 'Storage', href: '/shop/home/storage' },
        ],
      },
    ],
  },
  { label: 'Sale', href: '/sale', highlight: true },
]

export function Header() {
  const { data: session } = useSession()
  const { itemCount, openCart } = useCartStore()
  const { openSearch, openMobileMenu } = useUIStore()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleMouseEnter = (label: string) => {
    clearTimeout(timeoutRef.current)
    setActiveMenu(label)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
      )}
    >
      <div className="container-full">
        <div className="flex h-[72px] items-center gap-8">

          {/* Mobile menu button */}
          <button
            onClick={openMobileMenu}
            className="lg:hidden btn-ghost p-2"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <span className="font-display text-xl font-semibold tracking-[0.08em] text-primary">
              INDIA<span className="text-gold">SHOPPING</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.columns ? handleMouseEnter(item.label) : undefined}
                onMouseLeave={() => item.columns ? handleMouseLeave() : undefined}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    item.highlight
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                    activeMenu === item.label && 'text-primary bg-gray-50'
                  )}
                >
                  {item.label}
                  {item.columns && (
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 transition-transform duration-200',
                        activeMenu === item.label && 'rotate-180'
                      )}
                    />
                  )}
                </Link>

                {/* Mega Menu */}
                {item.columns && activeMenu === item.label && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 grid grid-cols-3 gap-6 animate-scale-in"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.columns.map((col) => (
                      <div key={col.title}>
                        <p className="text-2xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">
                          {col.title}
                        </p>
                        <ul className="space-y-2">
                          {col.links.map((link) => (
                            <li key={link.label}>
                              <Link
                                href={link.href}
                                className="text-sm text-gray-600 hover:text-primary transition-colors"
                                onClick={() => setActiveMenu(null)}
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {item.featured && (
                      <div className="relative overflow-hidden rounded-xl bg-gray-50">
                        <div className="absolute inset-0 bg-gradient-dark opacity-60 z-10" />
                        <div className="absolute inset-0 z-20 flex flex-col justify-end p-4">
                          <p className="text-white text-sm font-semibold">{item.featured.text}</p>
                          <Link
                            href={item.href}
                            className="mt-2 text-xs text-gold hover:underline"
                            onClick={() => setActiveMenu(null)}
                          >
                            Shop Now →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Search */}
            <button
              onClick={openSearch}
              className="btn-ghost p-2.5 rounded-lg"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              className="btn-ghost p-2.5 rounded-lg hidden sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Account */}
            {session ? (
              <div className="relative group">
                <button className="btn-ghost p-1.5 rounded-lg flex items-center gap-1.5">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || ''}
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-primary">{session.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                  </div>
                  {[
                    { icon: Package, label: 'My Orders', href: '/account/orders' },
                    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
                    { icon: Gift, label: 'Rewards', href: '/account/rewards' },
                    { icon: Bell, label: 'Notifications', href: '/account/notifications' },
                    { icon: Settings, label: 'Settings', href: '/account/settings' },
                  ].map(({ icon: Icon, label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      href="/api/auth/signout"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-ghost p-2.5 rounded-lg" aria-label="Sign in">
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative btn-ghost p-2.5 rounded-lg ml-1"
              aria-label={`Cart – ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-scale-in">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
