'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Quote } from 'lucide-react'
import { Truck, RefreshCw, Shield, HeadphonesIcon } from 'lucide-react'

// ─── Trust Bar ───────────────────────────────

export function TrustBar() {
  const items = [
    { icon: Truck,         title: 'Free Shipping',    desc: 'On orders above ₹499' },
    { icon: RefreshCw,     title: '30-Day Returns',   desc: 'Hassle-free returns' },
    { icon: Shield,        title: '100% Secure',      desc: '256-bit SSL encryption' },
    { icon: HeadphonesIcon,title: '24/7 Support',     desc: 'Always here for you' },
  ]
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="container-full py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Featured Categories ─────────────────────

const CATEGORIES = [
  { name: "Women's Fashion", slug: 'women', emoji: '👗', color: 'from-rose-100 to-pink-50', count: '12,000+' },
  { name: "Men's Fashion",   slug: 'men',   emoji: '👔', color: 'from-blue-100 to-sky-50',  count: '8,000+' },
  { name: 'Electronics',     slug: 'electronics', emoji: '📱', color: 'from-slate-100 to-gray-50', count: '5,000+' },
  { name: 'Home & Living',   slug: 'home',  emoji: '🏠', color: 'from-amber-100 to-yellow-50', count: '7,000+' },
  { name: 'Beauty',          slug: 'beauty',emoji: '✨', color: 'from-purple-100 to-violet-50', count: '3,000+' },
  { name: 'Sports',          slug: 'sports',emoji: '🏋️', color: 'from-green-100 to-emerald-50', count: '4,000+' },
]

export function FeaturedCategories() {
  return (
    <section className="container-full py-16">
      <div className="text-center mb-10">
        <p className="section-eyebrow">Browse by Category</p>
        <h2 className="section-title mt-2">Shop What You Love</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
          >
            <Link href={`/shop/${cat.slug}`}
              className={`group flex flex-col items-center p-5 rounded-2xl bg-gradient-to-br ${cat.color} border border-white hover:shadow-product-hover transition-all duration-300 hover:-translate-y-1`}>
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.emoji}</span>
              <p className="text-sm font-semibold text-gray-900 text-center leading-tight">{cat.name}</p>
              <p className="text-2xs text-gray-500 mt-1">{cat.count} items</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Section Header ──────────────────────────

function SectionHeader({ eyebrow, title, href, linkLabel = 'View All' }: { eyebrow: string; title: string; href: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title mt-1.5">{title}</h2>
      </div>
      <Link href={href} className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all duration-200 group">
        {linkLabel} <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}

// ─── Product Row (client placeholder) ────────

function ProductRowPlaceholder({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton rounded-xl h-80" />
      ))}
    </div>
  )
}

// ─── Best Sellers ─────────────────────────────

export function BestSellers() {
  return (
    <section className="container-full py-16">
      <SectionHeader eyebrow="Customer Favourites" title="Bestsellers" href="/shop?sort=popular" />
      <ProductRowPlaceholder count={4} />
      <div className="text-center mt-6 sm:hidden">
        <Link href="/shop?sort=popular" className="btn-outline rounded-lg text-sm">View All Bestsellers</Link>
      </div>
    </section>
  )
}

// ─── New Arrivals ─────────────────────────────

export function NewArrivals() {
  return (
    <section className="container-full py-16 bg-gray-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="container-full">
        <SectionHeader eyebrow="Just Landed" title="New Arrivals" href="/shop?sort=newest" />
        <ProductRowPlaceholder count={4} />
      </div>
    </section>
  )
}

// ─── Trending ─────────────────────────────────

export function TrendingSection() {
  return (
    <section className="container-full py-16">
      <SectionHeader eyebrow="What's Hot Right Now" title="Trending This Week" href="/shop?filter=trending" />
      <ProductRowPlaceholder count={4} />
    </section>
  )
}

// ─── Promo Banner ─────────────────────────────

export function PromoBanner() {
  return (
    <section className="container-full py-8">
      <div className="grid md:grid-cols-2 gap-5">
        {[
          { bg: 'bg-gradient-to-r from-primary to-primary-800', badge: 'Limited Time', title: 'Up to 50% off Electronics', sub: 'Smartphones, laptops & more', cta: 'Shop Now', href: '/shop/electronics', textColor: 'text-white' },
          { bg: 'bg-gradient-to-r from-amber-500 to-orange-400', badge: 'New Season', title: 'Festival Fashion is Here', sub: 'Ethnic wear starting ₹699', cta: 'Explore', href: '/shop/women/ethnic', textColor: 'text-white' },
        ].map((banner) => (
          <Link key={banner.title} href={banner.href}
            className={`group relative overflow-hidden rounded-2xl ${banner.bg} p-8 min-h-[160px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300`}>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-widest bg-white/20 text-white px-3 py-1 rounded-full mb-3">{banner.badge}</span>
              <h3 className={`font-display text-2xl font-medium ${banner.textColor} leading-tight`}>{banner.title}</h3>
              <p className={`text-sm mt-1 ${banner.textColor} opacity-80`}>{banner.sub}</p>
            </div>
            <span className={`inline-flex items-center gap-2 text-sm font-semibold ${banner.textColor} mt-4 group-hover:gap-3 transition-all`}>
              {banner.cta} <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ─── Brand Story ─────────────────────────────

export function BrandStory() {
  return (
    <section className="bg-primary text-white py-20 overflow-hidden">
      <div className="container-full">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-4">Our Story</p>
            <h2 className="font-display text-4xl lg:text-5xl font-light leading-tight mb-6">
              Built for <span className="text-gold italic">Bharat</span>,<br /> loved by millions
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-6">
              IndiaShoppingStore was born from a simple belief: every Indian deserves access to premium products at honest prices. We carefully curate every product we sell — no compromise on quality, no hidden costs.
            </p>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              From the lanes of Chandni Chowk to the studios of Bengaluru's designers, we bring you the best of India — and the world — delivered to your doorstep.
            </p>
            <Link href="/about" className="btn-gold rounded-lg">
              Learn More About Us <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: '50,000+', label: 'Products' },
              { value: '2 Lakh+', label: 'Happy Customers' },
              { value: '500+', label: 'Brands' },
              { value: '99.2%', label: 'Satisfaction Rate' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-2xl p-6 text-center border border-white/10">
                <p className="font-display text-4xl font-light text-gold">{stat.value}</p>
                <p className="text-white/60 text-sm mt-2">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Customer Reviews ─────────────────────────

const REVIEWS = [
  { name: 'Anita Desai', location: 'Mumbai', rating: 5, text: 'Absolutely love the quality! The silk saree I ordered is stunning — exactly as shown. Delivered in 3 days. Will definitely shop again.', product: 'Banarasi Silk Saree' },
  { name: 'Vikram Nair', location: 'Bengaluru', rating: 5, text: 'Best prices for electronics in India. Got my laptop at a great discount and it arrived well-packaged. The support team was very helpful.', product: 'Dell Laptop XPS 15' },
  { name: 'Priya Iyer', location: 'Chennai', rating: 5, text: 'The home decor collection is gorgeous. My living room looks like a magazine spread! Free shipping and easy returns made it stress-free.', product: 'Bohemian Wall Art Set' },
  { name: 'Rohit Sharma', location: 'Delhi', rating: 5, text: 'Ordered for my wife\'s birthday. The packaging was premium and she loved every piece. The loyalty points system is a great bonus!', product: 'Jewellery Gift Set' },
]

export function CustomerReviews() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container-full">
        <div className="text-center mb-12">
          <p className="section-eyebrow">What Customers Say</p>
          <h2 className="section-title mt-2">Loved by 2 Lakh+ Shoppers</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 fill-gold text-gold" />)}
            <span className="text-gray-600 text-sm ml-1">4.8/5 average rating</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <Quote className="h-6 w-6 text-gold/40 mb-3" />
              <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{review.text}"</p>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-gold text-gold" />)}
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-400">{review.location} · {review.product}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Blog Articles ─────────────────────────────

const BLOG_POSTS = [
  { title: '10 Ethnic Wear Trends Dominating 2024', slug: 'ethnic-wear-trends-2024', date: 'Dec 15, 2024', readTime: '4 min', category: 'Fashion' },
  { title: 'Best Budget Smartphones Under ₹15,000', slug: 'budget-smartphones-2024', date: 'Dec 10, 2024', readTime: '6 min', category: 'Electronics' },
  { title: 'Transform Your Home on a Budget', slug: 'home-decor-budget-tips', date: 'Dec 5, 2024', readTime: '5 min', category: 'Home & Living' },
]

export function BlogArticles() {
  return (
    <section className="container-full py-16">
      <SectionHeader eyebrow="From the Blog" title="Style & Living Guide" href="/blog" linkLabel="Read All Articles" />
      <div className="grid md:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-hover overflow-hidden group"
          >
            <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-50 relative">
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-30">
                {post.category === 'Fashion' ? '👗' : post.category === 'Electronics' ? '💻' : '🏠'}
              </div>
              <span className="absolute top-3 left-3 text-xs font-semibold text-white bg-primary/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug clamp-2 group-hover:text-primary transition-colors">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <div className="flex items-center gap-2 mt-3 text-2xs text-gray-400">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime} read</span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}

// ─── Instagram Gallery ─────────────────────────

export function InstagramGallery() {
  const placeholders = Array.from({ length: 6 }, (_, i) => i)
  return (
    <section className="container-full py-12">
      <div className="text-center mb-8">
        <p className="section-eyebrow">@indiashoppingstore</p>
        <h2 className="section-title mt-1.5">Follow Us on Instagram</h2>
        <p className="text-sm text-gray-500 mt-2">Tag your look with #IndiaShoppingStore for a chance to be featured</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {placeholders.map((i) => (
          <a key={i} href="https://instagram.com/indiashoppingstore" target="_blank" rel="noopener noreferrer"
            className="aspect-square rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden relative group hover:shadow-product-hover transition-all duration-300">
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">📷</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

// ─── Newsletter ───────────────────────────────

export function NewsletterSection() {
  return (
    <section className="container-full py-16">
      <div className="bg-gradient-to-r from-primary to-primary-800 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-30" />
        <div className="relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold mb-4">Newsletter</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-3">
            Get Exclusive Deals First
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Join 2 lakh+ subscribers. Get early access to sales, new arrivals, and styling tips.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" placeholder="your@email.com"
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors text-sm"
              aria-label="Email address" />
            <button type="submit" className="btn-gold rounded-xl px-6 py-3.5 text-sm font-semibold shrink-0">
              Subscribe Free
            </button>
          </form>
          <p className="text-white/30 text-xs mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  )
}
