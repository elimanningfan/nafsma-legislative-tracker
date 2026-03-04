import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nafsma.org'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
