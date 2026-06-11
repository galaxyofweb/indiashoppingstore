'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

const SLIDES = [
  {
    id: 1,
    eyebrow: 'New Season 2024',
    headline: 'Crafted for the\nModern India',
    subtext: 'Explore curated collections in fashion, electronics, and home décor.',
    cta: { label: 'Explore Collection', href: '/shop' },
    ctaSecondary: { label: 'View Lookbook', href: '/lookbook' },
    bg: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    accent: 'text-gold',
    image: '/images/banners/hero-1.jpg',
    badge: '50,000+ Products',
  },
  {
    id: 2,
    eyebrow: 'Electronics Sale',
    headline: 'Power Your\nWorld',
    subtext: 'Up to 40% off on premium smartphones, laptops, and smart devices.',
    cta: { label: 'Shop Electronics', href: '/shop/electronics' },
    ctaSecondary: { label: 'View All Deals', href: '/sale' },
    bg: 'from-[#0a0a1a] via-[#111122] to-[#0a0a1a]',
    accent: 'text-blue-400',
    image: '/images/banners/hero-2.jpg',
    badge: 'Up to 40% Off',
  },
  {
    id: 3,
    eyebrow: 'Premium Fashion',
    headline: 'Wear What\nInspires You',
    subtext: 'Exclusive ethnic and contemporary wear from India's finest designers.',
    cta: { label: 'Shop Fashion', href: '/shop/women' },
    ctaSecondary: { label: 'Men\'s Collection', href: '/shop/men' },
    bg: 'from-[#1a0a0a] via-[#2a1010] to-[#1a0a0a]',
    accent: 'text-rose-300',
    image: '/images/banners/hero-3.jpg',
    badge: 'New Arrivals',
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const go = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  const prev = () => {
    setDirection(-1)
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)
  }

  const next = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % SLIDES.length)
  }

  const slide = SLIDES[current]

  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(480px, 70vh, 760px)' }}>
      {/* Background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id + '-bg'}
          className={cn('absolute inset-0 bg-gradient-to-r', slide.bg)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-noise opacity-50 z-[1]" />

      {/* Content */}
      <div className="container-full relative z-10 h-full flex items-center py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">

          {/* Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-white"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold tracking-widest uppercase mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                {slide.badge}
              </motion.div>

              {/* Eyebrow */}
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50 mb-3">
                {slide.eyebrow}
              </p>

              {/* Headline */}
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] whitespace-pre-line text-balance">
                {slide.headline.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? (
                      <span className={cn('italic', slide.accent)}>{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                ))}
              </h1>

              {/* Subtext */}
              <p className="mt-5 text-base text-white/65 max-w-md leading-relaxed">
                {slide.subtext}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href={slide.cta.href} className="btn-gold rounded-lg">
                  {slide.cta.label}
                </Link>
                <Link
                  href={slide.ctaSecondary.href}
                  className="text-sm font-medium text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                >
                  {slide.ctaSecondary.label}
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-6">
                {[
                  { value: '50K+', label: 'Products' },
                  { value: '2L+', label: 'Customers' },
                  { value: '4.8★', label: 'Rating' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-2xl font-semibold text-gold">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: Floating Product Card (decorative) */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative w-80 h-96">
              {/* Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gold/20 blur-3xl" />
              {/* Card */}
              <div className="relative h-full glass rounded-3xl border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white/60 text-xs">Featured Product</p>
                  <p className="text-white font-semibold mt-0.5">Premium Collection</p>
                  <p className="text-gold font-mono font-bold mt-1">Starting ₹999</p>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-4 glass rounded-2xl border border-white/15 p-3 shadow-xl"
            >
              <p className="text-2xs text-white/60">FREE SHIPPING</p>
              <p className="text-white text-sm font-semibold">Above ₹499</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-4 -right-4 glass rounded-2xl border border-white/15 p-3 shadow-xl"
            >
              <p className="text-2xs text-white/60">EASY RETURNS</p>
              <p className="text-white text-sm font-semibold">30-Day Policy</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full glass border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={cn(
              'rounded-full transition-all duration-300',
              i === current
                ? 'w-8 h-2 bg-gold'
                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-surface to-transparent z-[5]" />
    </section>
  )
}
