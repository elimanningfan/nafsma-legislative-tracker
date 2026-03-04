import { PrismaClient } from '@prisma/client'

export async function seedEditableContent(prisma: PrismaClient) {
  console.log('  Seeding editable content...')

  const items = [
    // ============================================================
    // Homepage — Hero Section
    // ============================================================
    {
      id: 'homepage-hero-title',
      pageSlug: 'homepage',
      section: 'hero',
      label: 'Hero Title',
      content: 'Driving Flood and Stormwater Policy That Benefits Our Communities',
      contentType: 'text',
      order: 1,
    },
    {
      id: 'homepage-hero-subtitle',
      pageSlug: 'homepage',
      section: 'hero',
      label: 'Hero Subtitle',
      content: 'NAFSMA is the national voice for public flood control, stormwater, and water resource agencies — advocating with Congress and federal partners to protect lives, property, and communities across America.',
      contentType: 'text',
      order: 2,
    },
    {
      id: 'homepage-hero-cta1-label',
      pageSlug: 'homepage',
      section: 'hero',
      label: 'Primary CTA Label',
      content: 'Become a Member',
      contentType: 'text',
      order: 3,
    },
    {
      id: 'homepage-hero-cta1-href',
      pageSlug: 'homepage',
      section: 'hero',
      label: 'Primary CTA Link',
      content: '/membership',
      contentType: 'text',
      order: 4,
    },
    {
      id: 'homepage-hero-cta2-label',
      pageSlug: 'homepage',
      section: 'hero',
      label: 'Secondary CTA Label',
      content: 'Member Resources',
      contentType: 'text',
      order: 5,
    },
    {
      id: 'homepage-hero-cta2-href',
      pageSlug: 'homepage',
      section: 'hero',
      label: 'Secondary CTA Link',
      content: '/resources',
      contentType: 'text',
      order: 6,
    },

    // ============================================================
    // Homepage — Who We Serve
    // ============================================================
    {
      id: 'homepage-whoweserve-title',
      pageSlug: 'homepage',
      section: 'whoWeServe',
      label: 'Section Title',
      content: 'The Voice for Public Water Resource Agencies',
      contentType: 'text',
      order: 1,
    },
    {
      id: 'homepage-whoweserve-body',
      pageSlug: 'homepage',
      section: 'whoWeServe',
      label: 'Section Body',
      content: 'NAFSMA represents flood control districts, stormwater utilities, state agencies, and municipal public works departments nationwide. Our member agencies are on the frontlines of flood protection — operating levees, maintaining channels, managing stormwater systems, and partnering with federal agencies to protect the communities they serve.',
      contentType: 'text',
      order: 2,
    },
    {
      id: 'homepage-whoweserve-icon1',
      pageSlug: 'homepage',
      section: 'whoWeServe',
      label: 'Icon 1 — Flood Control Districts',
      content: JSON.stringify({ icon: 'flood-control', label: 'Flood Control Districts' }),
      contentType: 'json',
      order: 3,
    },
    {
      id: 'homepage-whoweserve-icon2',
      pageSlug: 'homepage',
      section: 'whoWeServe',
      label: 'Icon 2 — Stormwater Utilities',
      content: JSON.stringify({ icon: 'stormwater', label: 'Stormwater Utilities' }),
      contentType: 'json',
      order: 4,
    },
    {
      id: 'homepage-whoweserve-icon3',
      pageSlug: 'homepage',
      section: 'whoWeServe',
      label: 'Icon 3 — State Water Agencies',
      content: JSON.stringify({ icon: 'state-agency', label: 'State Water Agencies' }),
      contentType: 'json',
      order: 5,
    },
    {
      id: 'homepage-whoweserve-icon4',
      pageSlug: 'homepage',
      section: 'whoWeServe',
      label: 'Icon 4 — Municipal Public Works',
      content: JSON.stringify({ icon: 'municipal', label: 'Municipal Public Works' }),
      contentType: 'json',
      order: 6,
    },

    // ============================================================
    // Homepage — Why NAFSMA (Value Proposition Cards)
    // ============================================================
    {
      id: 'homepage-whynafsma-title',
      pageSlug: 'homepage',
      section: 'whyNafsma',
      label: 'Section Title',
      content: 'Your Direct Line to Federal Policy',
      contentType: 'text',
      order: 1,
    },
    {
      id: 'homepage-whynafsma-card1',
      pageSlug: 'homepage',
      section: 'whyNafsma',
      label: 'Card 1 — Federal Access',
      content: JSON.stringify({
        title: 'Federal Access',
        body: 'Connect directly with USACE, FEMA, and EPA leadership through exclusive members-only briefings, annual partnership meetings, and webinars with federal administrators.',
      }),
      contentType: 'json',
      order: 2,
    },
    {
      id: 'homepage-whynafsma-card2',
      pageSlug: 'homepage',
      section: 'whyNafsma',
      label: 'Card 2 — Policy Intelligence',
      content: JSON.stringify({
        title: 'Policy Intelligence',
        body: 'Stay ahead of regulatory and legislative developments with timely policy alerts, bill tracking, and expert analysis of changes that affect your agency\'s operations and funding.',
      }),
      contentType: 'json',
      order: 3,
    },
    {
      id: 'homepage-whynafsma-card3',
      pageSlug: 'homepage',
      section: 'whyNafsma',
      label: 'Card 3 — Community of Support',
      content: JSON.stringify({
        title: 'Community of Support',
        body: 'When your agency joins NAFSMA, you join a community of experienced water resource professionals — peers who understand your challenges and share your commitment to public safety.',
      }),
      contentType: 'json',
      order: 4,
    },
    {
      id: 'homepage-whynafsma-card4',
      pageSlug: 'homepage',
      section: 'whyNafsma',
      label: 'Card 4 — Collective Advocacy',
      content: JSON.stringify({
        title: 'Collective Advocacy',
        body: 'Your voice is stronger with NAFSMA. We translate member agency experience into policy positions that shape how Congress and federal agencies approach flood and stormwater issues.',
      }),
      contentType: 'json',
      order: 5,
    },

    // ============================================================
    // Homepage — By the Numbers (Stats)
    // ============================================================
    {
      id: 'homepage-stats-years',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Years Stat',
      content: '46+',
      contentType: 'text',
      order: 1,
    },
    {
      id: 'homepage-stats-years-label',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Years Label',
      content: 'Years of Federal Advocacy',
      contentType: 'text',
      order: 2,
    },
    {
      id: 'homepage-stats-agencies',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Agencies Stat',
      content: '200+',
      contentType: 'text',
      order: 3,
    },
    {
      id: 'homepage-stats-agencies-label',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Agencies Label',
      content: 'Member Agencies Nationwide',
      contentType: 'text',
      order: 4,
    },
    {
      id: 'homepage-stats-partners',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Partners Stat',
      content: '3',
      contentType: 'text',
      order: 5,
    },
    {
      id: 'homepage-stats-partners-label',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Partners Label',
      content: 'Federal Agency Partners (USACE, FEMA, EPA)',
      contentType: 'text',
      order: 6,
    },
    {
      id: 'homepage-stats-conference',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Conference Stat',
      content: 'Annual',
      contentType: 'text',
      order: 7,
    },
    {
      id: 'homepage-stats-conference-label',
      pageSlug: 'homepage',
      section: 'stats',
      label: 'Conference Label',
      content: 'Conference Bringing Members and Federal Leaders Together',
      contentType: 'text',
      order: 8,
    },

    // ============================================================
    // Homepage — Current Policy Priorities
    // ============================================================
    {
      id: 'homepage-priorities-title',
      pageSlug: 'homepage',
      section: 'priorities',
      label: 'Section Title',
      content: 'What We\'re Working On',
      contentType: 'text',
      order: 1,
    },
    {
      id: 'homepage-priorities-item1',
      pageSlug: 'homepage',
      section: 'priorities',
      label: 'Priority 1 — WRDA 2026',
      content: JSON.stringify({
        title: 'WRDA 2026',
        body: 'Advancing legislative provisions that streamline project delivery, reduce regulatory barriers, and improve federal-local partnerships',
        href: '/policy',
      }),
      contentType: 'json',
      order: 2,
    },
    {
      id: 'homepage-priorities-item2',
      pageSlug: 'homepage',
      section: 'priorities',
      label: 'Priority 2 — Federal Appropriations',
      content: JSON.stringify({
        title: 'Federal Appropriations',
        body: 'Securing funding for USACE, FEMA, and EPA programs that support member agency operations and infrastructure',
        href: '/policy',
      }),
      contentType: 'json',
      order: 3,
    },
    {
      id: 'homepage-priorities-item3',
      pageSlug: 'homepage',
      section: 'priorities',
      label: 'Priority 3 — Regulatory Reform',
      content: JSON.stringify({
        title: 'Regulatory Reform',
        body: 'Engaging on WOTUS, ESA, and stormwater regulations to ensure workable standards for member agencies',
        href: '/policy',
      }),
      contentType: 'json',
      order: 4,
    },

    // ============================================================
    // Homepage — Newsletter Signup
    // ============================================================
    {
      id: 'homepage-newsletter-title',
      pageSlug: 'homepage',
      section: 'newsletter',
      label: 'Newsletter Title',
      content: 'Stay Informed on Federal Flood and Stormwater Policy',
      contentType: 'text',
      order: 1,
    },
    {
      id: 'homepage-newsletter-body',
      pageSlug: 'homepage',
      section: 'newsletter',
      label: 'Newsletter Body',
      content: 'Sign up for NAFSMA\'s policy updates — timely intelligence on federal legislation, regulatory changes, and funding opportunities that affect water resource agencies.',
      contentType: 'text',
      order: 2,
    },
    {
      id: 'homepage-newsletter-cta',
      pageSlug: 'homepage',
      section: 'newsletter',
      label: 'Newsletter CTA',
      content: 'Subscribe to Updates',
      contentType: 'text',
      order: 3,
    },

    // ============================================================
    // Homepage — Footer Tagline
    // ============================================================
    {
      id: 'homepage-footer-tagline',
      pageSlug: 'homepage',
      section: 'footer',
      label: 'Footer Tagline',
      content: 'For more than 46 years, NAFSMA has been built from the ground up to benefit public agencies. Join us.',
      contentType: 'text',
      order: 1,
    },

    // ============================================================
    // About — Staff Bios
    // ============================================================
    {
      id: 'about-staff-sunny',
      pageSlug: 'about',
      section: 'staff',
      label: 'Sunny Simpkins — Executive Director',
      content: JSON.stringify({
        name: 'Sunny Simpkins',
        title: 'Executive Director',
        email: 'sunnys@nafsma.org',
        phone: '(202) 289-8625',
        bio: 'Sunny Simpkins serves as Executive Director of NAFSMA, leading the organization\'s federal advocacy, member engagement, and strategic direction. With deep expertise in water resource policy and federal partnerships, Sunny works directly with Congressional committee staff, USACE, FEMA, and EPA leadership to advance policies that benefit public flood control and stormwater agencies nationwide.',
      }),
      contentType: 'json',
      order: 1,
    },
    {
      id: 'about-staff-jennifer',
      pageSlug: 'about',
      section: 'staff',
      label: 'Jennifer Cole — Director of Operations',
      content: JSON.stringify({
        name: 'Jennifer Cole',
        title: 'Director of Operations',
        email: 'jennifer@nafsma.org',
        bio: 'Jennifer Cole manages NAFSMA\'s day-to-day operations, membership services, event logistics, and organizational administration. Jennifer serves as the primary point of contact for member agencies on operational matters, event registration, and resource access.',
      }),
      contentType: 'json',
      order: 2,
    },
    {
      id: 'about-staff-susan',
      pageSlug: 'about',
      section: 'staff',
      label: 'Susan Gilson — Senior Policy Advisor',
      content: JSON.stringify({
        name: 'Susan Gilson',
        title: 'Senior Policy Advisor',
        email: 'susan@nafsma.org',
        bio: 'Susan Gilson provides expert policy analysis and advocacy support on federal legislative and regulatory issues affecting NAFSMA member agencies. Susan tracks Congressional developments, drafts comment letters and position papers, and supports NAFSMA\'s engagement on WRDA, federal appropriations, NFIP, and regulatory matters.',
      }),
      contentType: 'json',
      order: 3,
    },

    // ============================================================
    // Contact Page
    // ============================================================
    {
      id: 'contact-executive-director',
      pageSlug: 'contact',
      section: 'contactInfo',
      label: 'Executive Director',
      content: JSON.stringify({
        name: 'Sunny Simpkins',
        title: 'Executive Director',
        email: 'sunnys@nafsma.org',
        phone: '(202) 289-8625',
      }),
      contentType: 'json',
      order: 1,
    },
    {
      id: 'contact-operations',
      pageSlug: 'contact',
      section: 'contactInfo',
      label: 'Director of Operations',
      content: JSON.stringify({
        name: 'Jennifer Cole',
        title: 'Director of Operations',
        email: 'jennifer@nafsma.org',
      }),
      contentType: 'json',
      order: 2,
    },
    {
      id: 'contact-mailing-address',
      pageSlug: 'contact',
      section: 'contactInfo',
      label: 'Mailing Address',
      content: JSON.stringify({
        organization: 'National Association of Flood & Stormwater Management Agencies',
        street: 'P.O. Box 4336',
        city: 'Silver Spring',
        state: 'MD',
        zip: '20914',
      }),
      contentType: 'json',
      order: 3,
    },
    {
      id: 'contact-website',
      pageSlug: 'contact',
      section: 'contactInfo',
      label: 'Website',
      content: 'www.nafsma.org',
      contentType: 'text',
      order: 4,
    },

    // ============================================================
    // Membership — Dues Tables
    // ============================================================
    {
      id: 'membership-agency-dues',
      pageSlug: 'membership',
      section: 'dues',
      label: 'Member Agency Dues Table',
      content: JSON.stringify({
        title: 'Member Agency Dues',
        subtitle: 'Tiered by population served by your agency',
        tiers: [
          { population: '100,000 or fewer', amount: 1500 },
          { population: '100,001 - 300,000', amount: 2500 },
          { population: '300,001 - 500,000', amount: 4000 },
          { population: '500,001 - 1,000,000', amount: 6000 },
          { population: '1,000,001 - 2,000,000', amount: 7500 },
          { population: 'More than 2,000,000', amount: 9500 },
        ],
        note: 'Member agencies are public flood control districts, stormwater utilities, state agencies, and municipal public works departments.',
      }),
      contentType: 'json',
      order: 1,
    },
    {
      id: 'membership-associate-dues',
      pageSlug: 'membership',
      section: 'dues',
      label: 'Associate Member Dues Table',
      content: JSON.stringify({
        title: 'Associate Member Dues',
        subtitle: 'For private sector firms — engineering, consulting, legal, and technology companies',
        tiers: [
          { size: '1 - 30 employees', amount: 2000 },
          { size: '31 - 100 employees', amount: 3000 },
          { size: 'More than 100 employees', amount: 4000 },
        ],
        note: 'Associate members participate in NAFSMA events, network with public agency members, and support NAFSMA\'s mission through their partnership.',
      }),
      contentType: 'json',
      order: 2,
    },
    {
      id: 'membership-benefits-comparison',
      pageSlug: 'membership',
      section: 'benefits',
      label: 'Benefits Comparison Table',
      content: JSON.stringify({
        headers: ['Benefit', 'Member Agency', 'Associate'],
        rows: [
          ['Members-only webinars with USACE, FEMA, EPA', true, true],
          ['Monthly policy newsletters', true, true],
          ['Timely policy alerts', true, true],
          ['Annual Meeting registration', true, true],
          ['Access to mentoring sessions', true, true],
          ['Committee participation', true, 'Observer'],
          ['Direct advocacy representation', true, false],
          ['Annual USACE Partnership Meeting access', true, false],
          ['Members-only resource library', true, 'Limited'],
          ['Award eligibility (Innovative Projects)', true, false],
          ['Award eligibility (Communications)', true, false],
          ['Congressional briefing participation', true, false],
        ],
      }),
      contentType: 'json',
      order: 3,
    },
  ]

  for (const item of items) {
    await prisma.editableContent.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    })
  }

  console.log(`    ✓ ${items.length} editable content items seeded`)
}
