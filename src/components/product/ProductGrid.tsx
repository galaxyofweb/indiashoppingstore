'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard, ProductCardSkeleton } from './ProductCard'
import type { ProductListItem } from '@/types'
import { cn } from '@/utils/cn'

// ─── ProductGrid ─────────────────────────────

interface ProductGridProps {
  products: ProductListItem[]
  page: number
  totalPages: number
  loading?: boolean
}

export function ProductGrid({ products, page, totalPages, loading }: ProductGridProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
        <Link href="/shop" className="btn-primary rounded-lg">Browse All Products</Link>
      </div>
    )
  }

  return (
    <div className="mt-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} priority={i < 4} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="btn-outline rounded-lg px-3 py-2 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p: number
            if (totalPages <= 7) p = i + 1
            else if (page <= 4) p = i + 1
            else if (page >= totalPages - 3) p = totalPages - 6 + i
            else p = page - 3 + i

            return (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={cn(
                  'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                  p === page
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {p}
              </button>
            )
          })}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages}
            className="btn-outline rounded-lg px-3 py-2 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
