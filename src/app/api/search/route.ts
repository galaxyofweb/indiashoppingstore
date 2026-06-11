import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getCache, setCache } from '@/lib/cache/redis'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const limit = Math.min(Number(searchParams.get('limit')) || 24, 100)
    const page = Number(searchParams.get('page')) || 1
    const sort = searchParams.get('sort') || 'relevance'

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: { products: [], total: 0, facets: {} } })
    }

    const cacheKey = `search:${q}:${page}:${sort}:${limit}`
    const cached = await getCache(cacheKey)
    if (cached) return NextResponse.json({ success: true, data: cached })

    // Save search query for analytics
    prisma.searchQuery.create({ data: { query: q } }).catch(() => {})

    const where: any = {
      status: 'ACTIVE',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q.toLowerCase()] } },
        { brand: { name: { contains: q, mode: 'insensitive' } } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
      ],
    }

    const orderBy: any = {
      relevance: { salesCount: 'desc' },
      newest: { createdAt: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      rating: { rating: 'desc' },
    }[sort] || { salesCount: 'desc' }

    const [products, total, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, name: true, slug: true, price: true,
          comparePrice: true, thumbnail: true, images: true,
          rating: true, reviewCount: true, isBestseller: true,
          isNewArrival: true, isTrending: true, stock: true,
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
      prisma.product.groupBy({
        by: ['categoryId'],
        where,
        _count: { id: true },
        take: 10,
      }),
      prisma.product.groupBy({
        by: ['brandId'],
        where: { ...where, brandId: { not: null } },
        _count: { id: true },
        take: 10,
      }),
    ])

    const priceRange = products.length > 0 ? {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price)),
    } : { min: 0, max: 0 }

    const result = {
      products,
      total,
      page,
      pageSize: limit,
      hasMore: page * limit < total,
      query: q,
      facets: { priceRange },
    }

    await setCache(cacheKey, result, 120)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
