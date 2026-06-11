'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore, useWishlistStore } from '@/store'
import { formatINR, calculateDiscountPercent } from '@/utils/gst'
import { cn } from '@/utils/cn'
import type { ProductListItem } from '@/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: ProductListItem
  priority?: boolean
  className?: string
}

export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCartStore()
  const { toggleItem, isWishlisted } = useWishlistStore()

  const wishlisted = isWishlisted(product.id)
  const discountPercent = calculateDiscountPercent(product.price, product.comparePrice || 0)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || isAdding) return

    setIsAdding(true)
    addItem(product)
    toast.success(`${product.name.slice(0, 30)} added to cart!`)
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product.id)
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn('product-card', className)}
    >
      <Link href={`/products/${product.slug}`} className="block">

        {/* Image Container */}
        <div
          className="relative aspect-product overflow-hidden bg-gray-50"
          onMouseEnter={() => product.images.length > 1 && setImageIndex(1)}
          onMouseLeave={() => setImageIndex(0)}
        >
          <Image
            src={product.images[imageIndex] || product.thumbnail || '/images/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover object-center transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full border">
                Out of Stock
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isBestseller && (
              <span className="badge-bestseller">Bestseller</span>
            )}
            {product.isNewArrival && (
              <span className="badge-new">New</span>
            )}
            {product.isTrending && (
              <span className="badge-hot">🔥 Trending</span>
            )}
            {discountPercent >= 5 && (
              <span className="badge-sale">{discountPercent}% off</span>
            )}
          </div>

          {/* Actions on hover */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200',
                wishlisted
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-white/90 text-gray-500 hover:bg-red-500 hover:text-white'
              )}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn('h-3.5 w-3.5', wishlisted && 'fill-current')} />
            </button>

            {/* Quick View */}
            <Link
              href={`/products/${product.slug}`}
              className="w-8 h-8 rounded-full bg-white/90 text-gray-500 flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-all duration-200"
              aria-label="Quick view"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quick Add Button */}
          {!isOutOfStock && (
            <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full bg-primary/95 backdrop-blur-sm text-white py-3 text-xs font-semibold tracking-wider flex items-center justify-center gap-2 hover:bg-primary transition-colors"
              >
                {isAdding ? (
                  <span className="animate-pulse">Adding...</span>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Quick Add
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-2xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-gray-900 clamp-2 leading-snug hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'h-3 w-3',
                      star <= Math.round(product.rating)
                        ? 'fill-gold text-gold'
                        : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-2xs text-gray-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="price-current">{formatINR(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="price-original">{formatINR(product.comparePrice)}</span>
                {discountPercent > 0 && (
                  <span className="price-discount">{discountPercent}% off</span>
                )}
              </>
            )}
          </div>

          {/* Free shipping indicator */}
          {product.price >= 499 && (
            <p className="text-2xs text-emerald-600 mt-1.5 flex items-center gap-1">
              <span>✓</span> Free delivery
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Skeleton ────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
      <div className="skeleton aspect-product" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-24 rounded" />
      </div>
    </div>
  )
}
