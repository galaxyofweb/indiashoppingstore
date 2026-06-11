'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, ArrowRight, TrendingUp, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store'
import { formatINR } from '@/utils/gst'
import { useDebounce } from '@/hooks/useDebounce'

const TRENDING_SEARCHES = [
  'Silk sarees', 'iPhone 15', 'Home decor', 'Kurta sets',
  'Wireless earbuds', 'Yoga mat', 'Perfumes', 'Running shoes',
]

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  thumbnail?: string
  category: { name: string }
}

export function SearchModal() {
  const router = useRouter()
  const { searchOpen, closeSearch } = useUIStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 280)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iss-recent-searches')
      if (stored) setRecent(JSON.parse(stored).slice(0, 6))
    } catch {}
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [searchOpen])

  // Fetch results
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data.data?.products || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [debouncedQuery])

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeSearch])

  const saveRecent = useCallback((q: string) => {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 6)
    setRecent(next)
    try { localStorage.setItem('iss-recent-searches', JSON.stringify(next)) } catch {}
  }, [recent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    saveRecent(query.trim())
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSuggestion = (q: string) => {
    saveRecent(q)
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeSearch}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="fixed top-0 inset-x-0 z-50 bg-white shadow-2xl rounded-b-2xl mx-auto max-w-3xl"
          >
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands, categories..."
                className="flex-1 text-base text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 ml-2 transition-colors"
              >
                ESC
              </button>
            </form>

            {/* Results / Suggestions */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Products</p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => { saveRecent(query); closeSearch() }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.thumbnail && (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{product.category.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-semibold text-primary text-sm">{formatINR(product.price)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </Link>
                  ))}

                  {/* View all */}
                  <button
                    onClick={handleSubmit as any}
                    className="w-full text-center text-sm text-primary font-medium py-3 hover:bg-primary/5 rounded-xl transition-colors mt-2"
                  >
                    View all results for "{query}"
                  </button>
                </div>
              )}

              {/* No results */}
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm">No results for "<strong>{query}</strong>"</p>
                  <p className="text-gray-400 text-xs mt-1">Try different keywords or browse categories</p>
                </div>
              )}

              {/* Default state: trending + recent */}
              {!query && (
                <div className="space-y-6">
                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                          Recent Searches
                        </p>
                        <button
                          onClick={() => { setRecent([]); localStorage.removeItem('iss-recent-searches') }}
                          className="text-xs text-gray-400 hover:text-primary transition-colors"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => handleSuggestion(r)}
                            className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <Clock className="h-3 w-3 text-gray-400" />
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Trending Now
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((t) => (
                        <button
                          key={t}
                          onClick={() => handleSuggestion(t)}
                          className="text-sm text-primary bg-primary/5 hover:bg-primary/10 px-4 py-1.5 rounded-full transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
