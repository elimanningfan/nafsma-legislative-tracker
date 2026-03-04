import { PrismaClient } from '@prisma/client'

export async function seedEvents(prisma: PrismaClient) {
  console.log('  Seeding events...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  const events = [
    // Annual Meeting — full details
    {
      title: 'NAFSMA 2026 Annual Meeting',
      slug: 'annual-meeting-2026',
      description: 'The NAFSMA Annual Meeting brings together 200+ professionals from local, regional, and state water resource agencies with leaders from USACE, FEMA, and EPA. Over four days, attendees engage in high-level policy discussions, agency roundtables, committee meetings, and networking with peers navigating the same federal partnership challenges. Sessions include briefings from USACE, FEMA, and EPA senior leadership on current programs, policy roundtables on WRDA 2026 and federal appropriations, committee meetings where members shape NAFSMA advocacy positions, and technical sessions on emerging flood and stormwater management topics. Registration opens January 2026. NAFSMA member agencies receive discounted registration rates.',
      date: new Date('2026-07-13'),
      endDate: new Date('2026-07-16'),
      location: 'Annapolis, Maryland',
      type: 'CONFERENCE' as const,
      status: 'PUBLISHED' as const,
      membersOnly: false,
      createdById: admin.id,
    },
    // Monthly webinars
    {
      title: 'USACE Civil Works Program Update',
      slug: 'webinar-usace-civil-works-april-2026',
      description: 'Join us for a members-only briefing from USACE leadership on the current status of civil works programs, including updates on project delivery, Section 408 permitting, and the WRDA 2026 legislative cycle. This webinar provides direct access to Army civil works decision-makers for questions and discussion relevant to non-federal sponsor agencies.',
      date: new Date('2026-04-15T14:00:00'),
      endDate: new Date('2026-04-15T15:30:00'),
      location: 'Virtual (Zoom)',
      type: 'WEBINAR' as const,
      status: 'PUBLISHED' as const,
      membersOnly: true,
      createdById: admin.id,
    },
    {
      title: 'FEMA NFIP and Risk Rating 2.0 Implementation Update',
      slug: 'webinar-fema-nfip-may-2026',
      description: 'FEMA leadership will brief NAFSMA member agencies on the latest National Flood Insurance Program developments, Risk Rating 2.0 implementation status, and upcoming Risk MAP updates. This members-only session includes time for member agency questions on NFIP issues affecting their communities.',
      date: new Date('2026-05-20T14:00:00'),
      endDate: new Date('2026-05-20T15:30:00'),
      location: 'Virtual (Zoom)',
      type: 'WEBINAR' as const,
      status: 'PUBLISHED' as const,
      membersOnly: true,
      createdById: admin.id,
    },
    {
      title: 'EPA Stormwater Regulatory Update: MS4 Permits and WOTUS',
      slug: 'webinar-epa-stormwater-june-2026',
      description: 'EPA program staff will provide an update on MS4 permit developments, WOTUS rulemaking status, and WIFIA program opportunities for stormwater and flood control infrastructure. This members-only briefing is an opportunity to hear directly from EPA leadership and raise questions about regulatory developments affecting member agency operations.',
      date: new Date('2026-06-17T14:00:00'),
      endDate: new Date('2026-06-17T15:30:00'),
      location: 'Virtual (Zoom)',
      type: 'WEBINAR' as const,
      status: 'PUBLISHED' as const,
      membersOnly: true,
      createdById: admin.id,
    },
    // Mentoring session
    {
      title: 'Mentoring Session: Innovation and AI in Water Management',
      slug: 'mentoring-ai-water-management-2026',
      description: 'NAFSMA\'s expert-led mentoring session brings together academics, federal experts, and senior practitioners for a focused discussion on how artificial intelligence and emerging technologies are transforming water resource management. Topics include real-time flood forecasting, predictive infrastructure maintenance, automated regulatory compliance, and data-driven stormwater program optimization.',
      date: new Date('2026-09-10T13:00:00'),
      endDate: new Date('2026-09-10T16:00:00'),
      location: 'Virtual (Zoom)',
      type: 'MENTORING' as const,
      status: 'PUBLISHED' as const,
      membersOnly: true,
      createdById: admin.id,
    },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: event,
    })
  }

  console.log(`    ✓ ${events.length} events seeded`)
}
