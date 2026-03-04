import { PrismaClient } from '@prisma/client'

export async function seedEvents(prisma: PrismaClient) {
  console.log('  Seeding events...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  // Placeholder — content-seeder will populate full details
  await prisma.event.upsert({
    where: { slug: 'annual-meeting-2026' },
    update: {},
    create: {
      title: 'NAFSMA 2026 Annual Meeting',
      slug: 'annual-meeting-2026',
      description: 'Join NAFSMA for our 2026 Annual Meeting in Annapolis, Maryland.',
      date: new Date('2026-07-13'),
      endDate: new Date('2026-07-16'),
      location: 'Annapolis, Maryland',
      type: 'CONFERENCE',
      status: 'PUBLISHED',
      createdById: admin.id,
    },
  })

  console.log('    ✓ Events seeded')
}
