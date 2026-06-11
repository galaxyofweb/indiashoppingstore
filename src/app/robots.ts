import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/', '/checkout/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/account/', '/checkout/'],
      },
    ],
    sitemap: 'https://indiashoppingstore.com/sitemap.xml',
    host: 'https://indiashoppingstore.com',
  }
}
