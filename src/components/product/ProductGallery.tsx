'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ProductGalleryProps {
  images: string[]
  name: string
  isBestseller?: boolean
  isNewArrival?: boolean
}

export function ProductGallery({ images, name, isBestseller, isNewArrival }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const allImages = images.length > 0 ? images : ['/images/placeholder.jpg']

  const prev = () => setActive((a) => (a - 1 + allImages.length) % allImages.length)
  const next = () => setActive((a) => (a + 1) % allImages.length)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  return (
    <div className="space-y-4 sticky top-24 self-start">
      {/* Main Image */}
      <div
        className={cn(
          'relative aspect-product rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in select-none',
          zoomed && 'cursor-zoom-out'
        )}
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={allImages[active]}
              alt={`${name} — image ${active + 1}`}
              fill
              className={cn(
                'object-cover transition-transform duration-200',
                zoomed && 'scale-[2]'
              )}
              style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
          {isBestseller && <span className="badge-bestseller">Bestseller</span>}
          {isNewArrival && <span className="badge-new">New Arrival</span>}
        </div>

        {/* Zoom hint */}
        {!zoomed && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-gray-600 pointer-events-none">
            <ZoomIn className="h-3 w-3" />
            Click to zoom
          </div>
        )}

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i) }}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === active ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-400'
                )}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-200',
                i === active ? 'border-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
