'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils/cn'

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: 9999999 },
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

interface FilterSection {
  id: string
  label: string
  open: boolean
}

interface ProductFiltersProps {
  categorySlug?: string
  currentFilters: Record<string, any>
}

export function ProductFilters({ categorySlug, currentFilters }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [sections, setSections] = useState<FilterSection[]>([
    { id: 'price', label: 'Price Range', open: true },
    { id: 'rating', label: 'Customer Rating', open: true },
    { id: 'availability', label: 'Availability', open: true },
  ])

  const toggleSection = (id: string) => {
    setSections((s) => s.map((sec) => sec.id === id ? { ...sec, open: !sec.open } : sec))
  }

  const updateFilter = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [pathname, router, searchParams])

  const clearAll = () => {
    router.push(pathname)
  }

  const hasFilters = !!(currentFilters.min || currentFilters.max || currentFilters.rating || currentFilters.inStock || currentFilters.brand)

  return (
    <div className="space-y-0.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <FilterSection
        title="Price Range"
        open={sections.find(s => s.id === 'price')?.open ?? true}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-2">
          {PRICE_RANGES.map((range) => {
            const isActive =
              String(currentFilters.min) === String(range.min) &&
              (range.max === 9999999
                ? !currentFilters.max
                : String(currentFilters.max) === String(range.max))

            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    updateFilter('min', null)
                    updateFilter('max', null)
                  } else {
                    updateFilter('min', String(range.min))
                    if (range.max !== 9999999) updateFilter('max', String(range.max))
                    else updateFilter('max', null)
                  }
                }}
                className={cn(
                  'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Customer Rating"
        open={sections.find(s => s.id === 'rating')?.open ?? true}
        onToggle={() => toggleSection('rating')}
      >
        <div className="space-y-2">
          {[4, 3, 2].map((r) => {
            const isActive = String(currentFilters.rating) === String(r)
            return (
              <button
                key={r}
                onClick={() => updateFilter('rating', isActive ? null : String(r))}
                className={cn(
                  'w-full text-left text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition-colors',
                  isActive ? 'bg-primary text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                <span className="text-xs ml-1">{r}★ & above</span>
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        open={sections.find(s => s.id === 'availability')?.open ?? true}
        onToggle={() => toggleSection('availability')}
      >
        <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-600 hover:text-primary transition-colors">
          <input
            type="checkbox"
            checked={currentFilters.inStock === 'true'}
            onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
          />
          In Stock Only
        </label>
      </FilterSection>
    </div>
  )
}

function FilterSection({
  title, open, onToggle, children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && children}
    </div>
  )
}
