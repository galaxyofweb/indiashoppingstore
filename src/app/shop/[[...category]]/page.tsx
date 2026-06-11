import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductSortBar } from '@/components/product/ProductSortBar'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { prisma } from '@/lib/db/prisma'
import { getCache, setCache } from '@/lib/cache/redis'

interface ShopPageProps {
  params: { category?: string[] }
  searchParams: {
    page?: string
    sort?: string
    brand?: string | string[]
    min?: string
    max?: string
    rating?: string
    inStock?: string
  }
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const slug = params.category?.join('/') || ''
  if (!slug) return { title: 'Shop All Products' }

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDesc: true, description: true },
  })

  return {
    title: category?.metaTitle || `${category?.name || 'Shop'} — IndiaShoppingStore`,
    description: category?.metaDesc || category?.description || undefined,
  }
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const categorySlug = params.category?.join('/') || ''
  const page = Number(searchParams.page) || 1
  const pageSize = 24
  const sort = searchParams.sort || 'popular'

  // Build where clause
  const where: any = { status: 'ACTIVE' }

  if (categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } })
    if (category) {
      // Include subcategories
      const subcats = await prisma.category.findMany({
        where: { parentId: category.id },
        select: { id: true },
      })
      const catIds = [category.id, ...subcats.map((c) => c.id)]
      where.categoryId = { in: catIds }
    }
  }

  if (searchParams.brand) {
    const brands = Array.isArray(searchParams.brand) ? searchParams.brand : [searchParams.brand]
    const brandRecords = await prisma.brand.findMany({
      where: { slug: { in: brands } },
      select: { id: true },
    })
    where.brandId = { in: brandRecords.map((b) => b.id) }
  }

  if (searchParams.min || searchParams.max) {
    where.price = {}
    if (searchParams.min) where.price.gte = Number(searchParams.min)
    if (searchParams.max) where.price.lte = Number(searchParams.max)
  }

  if (searchParams.rating) where.rating = { gte: Number(searchParams.rating) }
  if (searchParams.inStock === 'true') where.stock = { gt: 0 }

  // Sort
  const orderBy: any = {
    popular: { salesCount: 'desc' },
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    rating: { rating: 'desc' },
  }[sort] || { salesCount: 'desc' }

  const cacheKey = `products:list:${JSON.stringify({ where, page, sort })}`
  let cached = await getCache<any>(cacheKey)

  if (!cached) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
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
    ])
    cached = { products, total }
    await setCache(cacheKey, cached, 300)
  }

  const { products, total } = cached
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="container-full py-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/shop' },
          ...(categorySlug ? [{ label: categorySlug, href: `/shop/${categorySlug}` }] : []),
        ]}
      />

      <div className="mt-6 flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Suspense fallback={<div className="skeleton h-96 rounded-xl" />}>
            <ProductFilters
              categorySlug={categorySlug}
              currentFilters={searchParams}
            />
          </Suspense>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ProductSortBar
            total={total}
            currentSort={sort}
            currentPage={page}
            totalPages={totalPages}
          />

          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="skeleton rounded-xl h-80" />
                ))}
              </div>
            }
          >
            <ProductGrid products={products} page={page} totalPages={totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
