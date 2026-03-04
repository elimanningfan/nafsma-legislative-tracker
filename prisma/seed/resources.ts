import { PrismaClient } from '@prisma/client'

export async function seedResources(prisma: PrismaClient) {
  console.log('  Seeding resources...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  const resources = [
    // Guides — Members Only
    {
      title: 'NAFSMA Advocacy Guide: Authorizations & Appropriations',
      description: 'Comprehensive guide for member agencies on navigating the federal authorization and appropriations process. Covers WRDA legislative cycles, Energy & Water appropriations, and how member agencies can engage effectively with Congressional committee staff and federal agencies.',
      category: 'GUIDE' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2025-09-01'),
    },
    {
      title: 'NAFSMA Advocacy Best Practices Guide',
      description: 'Best practices for public flood control and stormwater agencies engaging in federal advocacy. Includes guidance on developing policy positions, building Congressional relationships, submitting effective comment letters, and participating in federal rulemaking processes.',
      category: 'GUIDE' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2025-06-01'),
    },
    {
      title: 'Federal Program Summary: USACE Civil Works',
      description: 'Overview of USACE civil works programs relevant to NAFSMA member agencies, including flood risk management, navigation, ecosystem restoration, and regulatory programs. Covers non-federal sponsor responsibilities, cost-sharing requirements, and project delivery processes.',
      category: 'GUIDE' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2025-03-01'),
    },

    // Position Papers — Public
    {
      title: 'NAFSMA Position on WRDA 2026 Priorities',
      description: 'NAFSMA\'s detailed position paper on Water Resources Development Act 2026 priorities, including alternative project delivery, Section 408 permitting reform, real estate acquisition streamlining, and technical review coordination.',
      category: 'POSITION_PAPER' as const,
      membersOnly: false,
      createdById: admin.id,
      publishedAt: new Date('2026-01-15'),
    },
    {
      title: 'NAFSMA Comment Letter: WOTUS Proposed Rule',
      description: 'NAFSMA\'s formal comment letter on the EPA\'s proposed Waters of the United States (WOTUS) rule, addressing implications for member agency maintenance activities, construction permitting, and operational flexibility.',
      category: 'POSITION_PAPER' as const,
      membersOnly: false,
      createdById: admin.id,
      publishedAt: new Date('2025-11-15'),
    },

    // Newsletters — Members Only
    {
      title: 'NAFSMA Policy Newsletter — February 2026',
      description: 'Monthly policy newsletter covering WRDA 2026 developments, FY26 appropriations update, NFIP reauthorization status, and upcoming member events.',
      category: 'NEWSLETTER' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2026-02-01'),
    },
    {
      title: 'NAFSMA Policy Newsletter — January 2026',
      description: 'Monthly policy newsletter covering the start of the 119th Congress, WRDA 2026 timeline, Annual Meeting registration opening, and federal regulatory outlook for 2026.',
      category: 'NEWSLETTER' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2026-01-01'),
    },

    // Committee Docs — Members Only
    {
      title: 'Legislative Committee Meeting Notes — January 2026',
      description: 'Notes from the NAFSMA Legislative Committee meeting covering WRDA 2026 strategy, federal appropriations advocacy plan, and member agency priority submissions.',
      category: 'COMMITTEE_DOC' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2026-01-20'),
    },

    // Webinar Recordings — Members Only
    {
      title: 'Webinar Recording: USACE Civil Works Program Update — March 2026',
      description: 'Recording of the March 2026 members-only webinar featuring USACE leadership on civil works program status, Section 408 processing improvements, and WRDA 2026 coordination.',
      category: 'WEBINAR_RECORDING' as const,
      membersOnly: true,
      createdById: admin.id,
      publishedAt: new Date('2026-03-15'),
    },
  ]

  for (const resource of resources) {
    await prisma.resource.create({ data: resource })
  }

  console.log(`    ✓ ${resources.length} resources seeded`)
}
