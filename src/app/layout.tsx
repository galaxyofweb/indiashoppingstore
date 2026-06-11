import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/layout/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SearchModal } from '@/components/shared/SearchModal'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://indiashoppingstore.com'),
  title: {
    default: 'IndiaShoppingStore — Premium Shopping, Indian Prices',
    template: '%s | IndiaShoppingStore',
  },
  description: 'Discover premium products across fashion, electronics, home decor and more. Free shipping on orders above ₹499. Cash on delivery available.',
  keywords: ['online shopping India', 'premium products', 'fashion', 'electronics', 'home decor', 'free shipping', 'COD'],
  authors: [{ name: 'IndiaShoppingStore' }],
  creator: 'IndiaShoppingStore',
  publisher: 'IndiaShoppingStore',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://indiashoppingstore.com',
    siteName: 'IndiaShoppingStore',
    title: 'IndiaShoppingStore — Premium Shopping, Indian Prices',
    description: 'Discover premium products across fashion, electronics, home decor and more.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'IndiaShoppingStore' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@indiashoppingstore',
    creator: '@indiashoppingstore',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://indiashoppingstore.com',
    languages: { 'en-IN': 'https://indiashoppingstore.com' },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <head>
        {/* Preconnect to CDN */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'IndiaShoppingStore',
              url: 'https://indiashoppingstore.com',
              logo: 'https://indiashoppingstore.com/logo.png',
              sameAs: [
                'https://facebook.com/indiashoppingstore',
                'https://instagram.com/indiashoppingstore',
                'https://twitter.com/indiashoppingstore',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['English', 'Hindi'],
                contactOption: 'TollFree',
              },
            }),
          }}
        />
        {/* JSON-LD Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: 'https://indiashoppingstore.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://indiashoppingstore.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="bg-surface font-sans text-gray-900 antialiased">
        <Providers>
          {/* Announcement Banner */}
          <div className="bg-gradient-gold py-2 px-4 text-center text-xs font-medium text-primary-950 tracking-wider">
            🎁 FREE SHIPPING ON ORDERS ABOVE ₹499 &nbsp;·&nbsp; USE CODE <strong>WELCOME10</strong> FOR 10% OFF
          </div>

          <Header />

          <main className="min-h-screen">
            {children}
          </main>

          <Footer />

          {/* Overlays */}
          <CartDrawer />
          <SearchModal />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
