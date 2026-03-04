import { PrismaClient } from '@prisma/client'

export async function seedBlog(prisma: PrismaClient) {
  console.log('  Seeding blog categories and tags...')

  const categories = [
    { name: 'Policy Updates', slug: 'policy-updates', color: '#1B4B82' },
    { name: 'Legislative News', slug: 'legislative-news', color: '#2A8080' },
    { name: 'Member Spotlight', slug: 'member-spotlight', color: '#0D2B4E' },
    { name: 'Events', slug: 'events', color: '#4A4A4A' },
    { name: 'Resources', slug: 'resources', color: '#1B4B82' },
    { name: 'Awards', slug: 'awards', color: '#2A8080' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  const tags = [
    'WRDA', 'NFIP', 'FEMA', 'EPA', 'USACE',
    'Stormwater', 'Infrastructure', 'Climate',
    'Appropriations', 'Clean Water', 'Flood Risk',
  ]

  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: tagName, slug },
    })
  }

  console.log(`    ✓ ${categories.length} categories, ${tags.length} tags seeded`)
}
