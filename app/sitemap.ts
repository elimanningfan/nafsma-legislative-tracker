import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nafsma.org'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about/staff`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about/board`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/membership`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/membership/join`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/policy`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/events`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/awards`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/awards/past-winners`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/awards/apply`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/news`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic blog posts
  const posts = await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  }).catch(() => [])

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic events
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  }).catch(() => [])

  const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${baseUrl}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic CMS pages
  const pages = await prisma.page.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  }).catch(() => [])

  const cmsPages: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...postPages, ...eventPages, ...cmsPages]
}
