import { PrismaClient } from '@prisma/client'

export async function seedAwards(prisma: PrismaClient) {
  console.log('  Seeding awards...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  const awards = [
    {
      year: 2025,
      category: 'INNOVATIVE_PROJECT' as const,
      winnerName: 'McLoud Run Flood Mitigation Project',
      agency: 'City of Cedar Rapids',
      city: 'Cedar Rapids',
      state: 'Iowa',
      description: 'The McLoud Run project demonstrates how flood protection can enhance communities through habitat restoration, recreation, and environmental stewardship. This multi-benefit project transformed a flood-prone corridor into an integrated system that combines engineered flood mitigation with restored wetlands, recreational trails, and native habitat areas. By designing for multiple objectives simultaneously, Cedar Rapids created a model that other water resource agencies nationwide can adapt — proving that flood infrastructure investment can deliver community value far beyond damage reduction. The McLoud Run project is a model for water resource agencies seeking to deliver multiple benefits from flood mitigation investments.',
      createdById: admin.id,
    },
    {
      year: 2025,
      category: 'COMMUNICATIONS' as const,
      winnerName: 'Houston Stormwater Master Plan',
      agency: 'City of Houston',
      city: 'Houston',
      state: 'Texas',
      description: 'Houston\'s comprehensive stormwater planning effort received special recognition for its scale, innovation, and commitment to community-centered flood solutions. The Stormwater Master Plan represents one of the most ambitious municipal stormwater planning initiatives in the country, integrating advanced hydraulic modeling, community engagement, and equity-focused prioritization to develop a long-term roadmap for managing flood risk across one of America\'s largest and most flood-prone cities. The plan\'s communications strategy effectively engaged diverse communities across Houston in understanding flood risk and participating in solution development — setting a standard for transparent, inclusive public engagement on complex water resource challenges.',
      createdById: admin.id,
    },
  ]

  for (const award of awards) {
    await prisma.award.create({ data: award })
  }

  console.log(`    ✓ ${awards.length} awards seeded`)
}
