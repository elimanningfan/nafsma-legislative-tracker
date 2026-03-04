import { PrismaClient } from '@prisma/client'

export async function seedResources(prisma: PrismaClient) {
  console.log('  Seeding resources...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  // Placeholder — content-seeder will populate
  const resources = [
    {
      title: 'NAFSMA Advocacy Guide',
      description: 'Comprehensive guide for member agencies on federal advocacy.',
      category: 'GUIDE' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date(),
    },
    {
      title: 'Best Practices Guide for Flood Management',
      description: 'Best practices compilation for public flood management agencies.',
      category: 'GUIDE' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date(),
    },
  ]

  for (const resource of resources) {
    await prisma.resource.create({ data: resource })
  }

  console.log(`    ✓ ${resources.length} resources seeded`)
}
