import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { prisma } from '@/lib/db/prisma'
import { getCache, setCache } from '@/lib/cache/redis'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductReviews } from '@/components/product/ProductReviews'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'

interface ProductPageProps {
  params: { slug: string }
}

async function getProduct(slug: string) {
  const cacheKey = `product:${slug}`
  const cached = await getCache<any>(cacheKey)
  if (cached) return cached

  const product = await prisma.product.findUnique({
    where: { slug, status: 'ACTIVE' },
    include: {
      category: { include: { parent: true } },
      brand: true,
      variants: { orderBy: { isDefault: 'desc' } },
      attributes: true,
      reviews: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { name: true, image: true } } },
      },
    },
  })

  if (product) {
    await setCache(cacheKey, product, 600)
    // Increment view count async
    prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {})
  }

  return product
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  if (!product) return { title: 'Product Not Found' }

  const images = product.images.length > 0
    ? [{ url: product.images[0], width: 800, height: 600, alt: product.name }]
    : []

  return {
    title: product.metaTitle || `${product.name} | IndiaShoppingStore`,
    description: product.metaDescription || product.shortDescription || undefined,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images,
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    ...(product.category.parent
      ? [{ label: product.category.parent.name, href: `/shop/${product.category.parent.slug}` }]
      : []),
    { label: product.category.name, href: `/shop/${product.category.slug}` },
    { label: product.name, href: `/products/${product.slug}` },
  ]

  // JSON-LD schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand.name } : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `https://indiashoppingstore.com/products/${product.slug}`,
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="container-full py-6">
        <Breadcrumbs items={breadcrumbs} />

        {/* Main Product Section */}
        <div className="mt-6 grid lg:grid-cols-2 gap-12 xl:gap-16">
          <ProductGallery
            images={product.images}
            name={product.name}
            isBestseller={product.isBestseller}
            isNewArrival={product.isNewArrival}
          />
          <ProductInfo product={product} />
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-16">
            <h2 className="section-title text-2xl mb-6">Product Description</h2>
            <div
              className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        {/* Reviews */}
        <section className="mt-16">
          <ProductReviews
            productId={product.id}
            reviews={product.reviews}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </section>

        {/* Related Products */}
        <section className="mt-16">
          <Suspense fallback={<div className="skeleton h-64 rounded-xl" />}>
            <RelatedProducts
              productId={product.id}
              categoryId={product.categoryId}
            />
          </Suspense>
        </section>
      </div>
    </>
  )
}
