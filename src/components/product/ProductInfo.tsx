'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag, Heart, Star, Share2, Shield, RefreshCw,
  Truck, Zap, ChevronDown, ChevronUp, BadgeCheck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCartStore, useWishlistStore } from '@/store'
import { formatINR, calculateDiscountPercent, calculateGST } from '@/utils/gst'
import { cn } from '@/utils/cn'

interface ProductInfoProps {
  product: any
}

export function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addItem } = useCartStore()
  const { toggleItem, isWishlisted } = useWishlistStore()

  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.find((v: any) => v.isDefault) || product.variants[0] || null
  )
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [descExpanded, setDescExpanded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [pincode, setPincode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null)

  const price = selectedVariant?.price || product.price
  const comparePrice = product.comparePrice
  const discount = calculateDiscountPercent(price, comparePrice || 0)
  const stock = selectedVariant?.stock ?? product.stock
  const isOutOfStock = stock === 0
  const isWishlist = isWishlisted(product.id)

  const gstBreakdown = calculateGST(price / (1 + product.gstRate / 100), product.gstRate)

  const handleAttrSelect = (name: string, value: string) => {
    const next = { ...selectedAttrs, [name]: value }
    setSelectedAttrs(next)
    // Find matching variant
    const match = product.variants.find((v: any) =>
      Object.entries(next).every(([k, val]) => v.attributes[k] === val)
    )
    if (match) setSelectedVariant(match)
  }

  const handleAddToCart = async () => {
    if (isOutOfStock) return
    setIsAdding(true)
    addItem(product, selectedVariant || undefined, quantity)
    toast.success('Added to cart!')
    setTimeout(() => setIsAdding(false), 600)
  }

  const handleBuyNow = async () => {
    if (isOutOfStock) return
    setIsBuying(true)
    addItem(product, selectedVariant || undefined, quantity)
    router.push('/checkout')
  }

  const handleCheckDelivery = async () => {
    if (pincode.length !== 6) {
      toast.error('Enter a valid 6-digit pincode')
      return
    }
    // Simulate delivery check
    await new Promise((r) => setTimeout(r, 600))
    setDeliveryInfo(`Delivery available by ${new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}`)
  }

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Brand & Category */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        {product.brand && (
          <span className="font-semibold text-primary">{product.brand.name}</span>
        )}
        <span>·</span>
        <span>{product.category.name}</span>
      </div>

      {/* Name */}
      <h1 className="font-display text-3xl lg:text-4xl font-medium text-primary leading-tight">
        {product.name}
      </h1>

      {/* Rating */}
      {product.reviewCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={cn('h-4 w-4', s <= Math.round(product.rating) ? 'fill-gold text-gold' : 'fill-gray-200 text-gray-200')} />
            ))}
          </div>
          <span className="text-sm font-semibold text-primary">{product.rating.toFixed(1)}</span>
          <a href="#reviews" className="text-sm text-gray-400 hover:text-primary transition-colors">
            ({product.reviewCount} reviews)
          </a>
          {product.isBestseller && (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <BadgeCheck className="h-3 w-3" /> Bestseller
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-end gap-3 flex-wrap">
          <span className="font-mono text-3xl font-bold text-primary">{formatINR(price)}</span>
          {comparePrice && comparePrice > price && (
            <>
              <span className="font-mono text-lg text-gray-400 line-through">{formatINR(comparePrice)}</span>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Save {discount}%
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Incl. {product.gstRate}% GST · Base price {formatINR(gstBreakdown.baseAmount)}
        </p>
        {price >= 499 && (
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Truck className="h-3 w-3" /> Free delivery on this item
          </p>
        )}
      </div>

      {/* Variants */}
      {product.attributes?.map((attr: any) => (
        <div key={attr.id}>
          <p className="text-sm font-semibold text-gray-900 mb-2.5">
            {attr.name}:
            {selectedAttrs[attr.name] && (
              <span className="ml-2 font-normal text-gray-500">{selectedAttrs[attr.name]}</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((val: string) => {
              const isColor = attr.name.toLowerCase().includes('color') || attr.name.toLowerCase().includes('colour')
              const isSelected = selectedAttrs[attr.name] === val

              return (
                <button
                  key={val}
                  onClick={() => handleAttrSelect(attr.name, val)}
                  className={cn(
                    'border-2 rounded-lg transition-all duration-150 text-sm font-medium',
                    isColor
                      ? 'w-8 h-8 rounded-full'
                      : 'px-4 py-2',
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-200 text-gray-700 hover:border-primary/50'
                  )}
                  aria-pressed={isSelected}
                >
                  {val}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Quantity */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-2.5">
          Quantity:
          {stock > 0 && stock <= 10 && (
            <span className="ml-2 text-orange-500 font-normal text-xs">Only {stock} left!</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-light"
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className="w-12 text-center font-semibold text-primary">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-light"
              disabled={quantity >= stock}
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-400">{stock > 0 ? `${stock} in stock` : 'Out of stock'}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={cn(
            'flex-1 btn-outline rounded-xl py-4 font-semibold',
            isAdding && 'opacity-70'
          )}
        >
          <ShoppingBag className="h-5 w-5" />
          {isAdding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || isBuying}
          className="flex-1 btn-gold rounded-xl py-4 font-semibold"
        >
          <Zap className="h-4 w-4" />
          {isBuying ? 'Please wait...' : 'Buy Now'}
        </button>
        <button
          onClick={() => toggleItem(product.id)}
          className={cn(
            'w-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200',
            isWishlist ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
          )}
          aria-label={isWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-5 w-5', isWishlist && 'fill-current')} />
        </button>
        <button
          onClick={handleShare}
          className="w-14 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-300 transition-colors"
          aria-label="Share product"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Delivery Check */}
      <div className="border border-gray-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" /> Check Delivery
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter pincode"
            className="input flex-1 py-2.5 text-sm"
          />
          <button onClick={handleCheckDelivery} className="btn-outline rounded-lg px-4 py-2.5 text-sm">
            Check
          </button>
        </div>
        {deliveryInfo && (
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1.5 font-medium">
            <Truck className="h-3.5 w-3.5" /> {deliveryInfo}
          </p>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Shield, label: '100% Genuine', sub: 'Authentic products' },
          { icon: RefreshCw, label: '30-Day Returns', sub: 'Hassle-free' },
          { icon: Truck, label: 'Fast Delivery', sub: '2–5 business days' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="text-center p-3 border border-gray-100 rounded-xl">
            <Icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-gray-900">{label}</p>
            <p className="text-2xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Short Description */}
      {product.shortDescription && (
        <div>
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 py-3 border-t border-gray-100"
          >
            Product Details
            {descExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {descExpanded && (
            <p className="text-sm text-gray-600 leading-relaxed pb-3">{product.shortDescription}</p>
          )}
        </div>
      )}

      {/* SKU / HSN */}
      <div className="text-xs text-gray-400 flex gap-4 pt-2 border-t border-gray-100">
        <span>SKU: <span className="text-gray-600">{product.sku}</span></span>
        {product.hsnCode && <span>HSN: <span className="text-gray-600">{product.hsnCode}</span></span>}
      </div>
    </div>
  )
}
