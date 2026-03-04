import { PrismaClient } from '@prisma/client'

export async function seedAwards(prisma: PrismaClient) {
  console.log('  Seeding awards...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  // Placeholder — content-seeder will populate with full descriptions
  const awards = [
    {
      year: 2025,
      category: 'INNOVATIVE_PROJECT' as const,
      winnerName: 'McLoud Run Flood Mitigation Project',
      agency: 'City of Cedar Rapids',
      city: 'Cedar Rapids',
      state: 'Iowa',
      description: 'Innovative flood mitigation project recognized for excellence.',
      createdById: admin.id,
    },
    {
      year: 2025,
      category: 'COMMUNICATIONS' as const,
      winnerName: 'Stormwater Master Plan Communications Campaign',
      agency: 'City of Houston',
      city: 'Houston',
      state: 'Texas',
      description: 'Outstanding communications campaign for stormwater management.',
      createdById: admin.id,
    },
  ]

  for (const award of awards) {
    await prisma.award.create({ data: award })
  }

  console.log(`    ✓ ${awards.length} awards seeded`)
}
