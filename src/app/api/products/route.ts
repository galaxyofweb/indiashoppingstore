// ─── /api/products/route.ts ──────────────────
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCache, setCache } from '@/lib/cache/redis'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Math.min(Number(searchParams.get('limit')) || 24, 100)
    const sort = searchParams.get('sort') || 'popular'
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const featured = searchParams.get('featured')
    const bestseller = searchParams.get('bestseller')
    const newArrival = searchParams.get('newArrival')
    const trending = searchParams.get('trending')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const inStock = searchParams.get('inStock')

    const cacheKey = `products:${req.url}`
    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json({ success: true, data: cached })

    const where: any = { status: 'ACTIVE' }
    if (category) where.category = { slug: category }
    if (brand) where.brand = { slug: brand }
    if (featured === 'true') where.isFeatured = true
    if (bestseller === 'true') where.isBestseller = true
    if (newArrival === 'true') where.isNewArrival = true
    if (trending === 'true') where.isTrending = true
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }
    if (inStock === 'true') where.stock = { gt: 0 }

    const orderBy: any = {
      popular: { salesCount: 'desc' },
      newest: { createdAt: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      rating: { rating: 'desc' },
    }[sort] || { salesCount: 'desc' }

    const select = {
      id: true, name: true, slug: true, price: true,
      comparePrice: true, thumbnail: true, images: true,
      rating: true, reviewCount: true, isBestseller: true,
      isNewArrival: true, isTrending: true, stock: true,
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, select }),
      prisma.product.count({ where }),
    ])

    const result = { products, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) }
    await setCache(cacheKey, result, 300)

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
