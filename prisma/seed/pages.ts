import { PrismaClient } from '@prisma/client'

export async function seedPages(prisma: PrismaClient) {
  console.log('  Seeding pages...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run seedUsers first')

  // Placeholder — content-seeder agent will populate with approved copy
  const pages = [
    { title: 'About — Who We Are', slug: 'about', template: 'about' },
    { title: 'Staff', slug: 'about/staff', template: 'staff' },
    { title: 'Board of Directors', slug: 'about/board', template: 'board' },
    { title: 'Policy & Advocacy', slug: 'policy', template: 'policy' },
    { title: 'Events & Education', slug: 'events', template: 'events' },
    { title: 'Annual Meeting 2026', slug: 'events/annual-meeting-2026', template: 'event-detail' },
    { title: 'Awards Program', slug: 'awards', template: 'awards' },
    { title: 'Past Award Winners', slug: 'awards/past-winners', template: 'awards-archive' },
    { title: 'Award Application', slug: 'awards/apply', template: 'awards-apply' },
    { title: 'Membership', slug: 'membership', template: 'membership' },
    { title: 'Contact', slug: 'contact', template: 'contact' },
    { title: 'Privacy Policy', slug: 'privacy', template: 'default' },
    { title: 'FAQ', slug: 'faq', template: 'faq' },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        content: '{}',
        status: 'PUBLISHED',
        authorId: admin.id,
        publishedAt: new Date(),
      },
    })
  }

  console.log(`    ✓ ${pages.length} pages seeded`)
}
