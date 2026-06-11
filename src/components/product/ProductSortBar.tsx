'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Star, ThumbsUp, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { ProductCard } from './ProductCard'
import { formatINR } from '@/utils/gst'
import { cn } from '@/utils/cn'
import type { ProductListItem } from '@/types'

// ─── Sort Bar ────────────────────────────────

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'rating', label: 'Top Rated' },
]

interface ProductSortBarProps {
  total: number
  currentSort: string
  currentPage: number
  totalPages: number
}

export function ProductSortBar({ total, currentSort, currentPage, totalPages }: ProductSortBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-primary">{total.toLocaleString('en-IN')}</span> products
        {totalPages > 1 && (
          <span className="ml-2 text-gray-400">· Page {currentPage} of {totalPages}</span>
        )}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full border transition-colors',
              currentSort === opt.value
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 text-gray-600 hover:border-primary/40'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Product Reviews ─────────────────────────

interface Review {
  id: string
  user: { name?: string; image?: string }
  rating: number
  title?: string
  body?: string
  images: string[]
  isVerified: boolean
  helpful: number
  createdAt: string
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  rating: number
  reviewCount: number
}

export function ProductReviews({ productId, reviews, rating, reviewCount }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false)

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    pct: reviewCount > 0 ? (reviews.filter((rev) => rev.rating === r).length / reviewCount) * 100 : 0,
  }))

  return (
    <div id="reviews">
      <div className="flex items-center justify-between mb-8">
        <h2 className="section-title text-2xl">Customer Reviews</h2>
        <button
          onClick={() => setShowForm(true)}
          className="btn-outline rounded-lg text-sm"
        >
          Write a Review
        </button>
      </div>

      {reviewCount > 0 ? (
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center text-center">
            <span className="font-display text-6xl font-light text-primary">{rating.toFixed(1)}</span>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={cn('h-5 w-5', s <= Math.round(rating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200')} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">{reviewCount} reviews</p>

            <div className="w-full mt-5 space-y-2">
              {ratingDist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-gray-500">{star}</span>
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-5 text-gray-500 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-5">
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {review.user.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{review.user.name || 'Anonymous'}</span>
                      {review.isVerified && (
                        <span className="flex items-center gap-1 text-2xs text-emerald-600 font-semibold">
                          <CheckCircle className="h-3 w-3" /> Verified Purchase
                        </span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn('h-3.5 w-3.5', s <= review.rating ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200')} />
                      ))}
                    </div>
                    {review.title && <p className="font-semibold text-gray-900 mt-2 text-sm">{review.title}</p>}
                    {review.body && <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>}
                    {review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-100">
                            <Image src={img} alt="Review image" fill className="object-cover" sizes="56px" />
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors mt-3">
                      <ThumbsUp className="h-3 w-3" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-gray-600 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to share your experience!</p>
          <button onClick={() => setShowForm(true)} className="btn-primary rounded-lg mt-4 text-sm">
            Write the First Review
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Related Products ─────────────────────────

interface RelatedProductsProps {
  productId: string
  categoryId: string
}

export function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  // This would normally fetch from API; placeholder for demo
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-eyebrow">You May Also Like</p>
          <h2 className="section-title text-2xl mt-1">Related Products</h2>
        </div>
      </div>
      <p className="text-sm text-gray-400 italic">Related products load dynamically from the /api/products/[id]/related endpoint.</p>
    </div>
  )
}
