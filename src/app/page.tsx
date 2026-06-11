import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { TrustBar } from '@/components/home/TrustBar'
import { FeaturedCategories } from '@/components/home/FeaturedCategories'
import { BestSellers } from '@/components/home/BestSellers'
import { NewArrivals } from '@/components/home/NewArrivals'
import { TrendingSection } from '@/components/home/TrendingSection'
import { BrandStory } from '@/components/home/BrandStory'
import { CustomerReviews } from '@/components/home/CustomerReviews'
import { BlogArticles } from '@/components/home/BlogArticles'
import { InstagramGallery } from '@/components/home/InstagramGallery'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { PromoBanner } from '@/components/home/PromoBanner'

export const metadata: Metadata = {
  title: 'IndiaShoppingStore — Premium Shopping, Indian Prices',
  description: 'Discover 50,000+ premium products across fashion, electronics, home decor and more. Free shipping above ₹499.',
}

export default function HomePage() {
  return (
    <div className="page-enter">
      <HeroSection />
      <TrustBar />
      <FeaturedCategories />
      <BestSellers />
      <PromoBanner />
      <NewArrivals />
      <BrandStory />
      <TrendingSection />
      <CustomerReviews />
      <BlogArticles />
      <InstagramGallery />
      <NewsletterSection />
    </div>
  )
}
