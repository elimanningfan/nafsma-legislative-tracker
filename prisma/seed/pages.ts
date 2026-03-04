import { PrismaClient } from '@prisma/client'
import { markdownToTipTap } from './utils'

export async function seedPages(prisma: PrismaClient) {
  console.log('  Seeding pages...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found — run seedUsers first')

  const aboutContent = markdownToTipTap(`## About NAFSMA

The National Association of Flood & Stormwater Management Agencies (NAFSMA) is a national nonprofit organization representing public agencies responsible for managing flood risk and stormwater across the United States. For more than 46 years, NAFSMA has advocated at the federal level on behalf of the agencies that protect communities from floods, manage stormwater runoff, and safeguard water quality.

## Our Mission

To advocate public policy, encourage technologies and conduct education programs which facilitate and enhance the achievement of the public service function of our members.

## Our Focus Areas

### Flood Risk Management

We advance policies, programs, and infrastructure investments that reduce flood risk and protect lives and property in communities nationwide.

### Stormwater Management

We support member agencies in managing stormwater runoff effectively — navigating federal regulations while pursuing innovative, cost-effective approaches.

### Water Quality Protection

We advocate for workable water quality standards and programs that protect receiving waters without creating unreasonable burdens on public agencies.

### Watershed Management

We promote holistic approaches to water resource management that recognize the interconnected nature of flood, stormwater, and water quality challenges.

## Our Federal Partnerships

NAFSMA maintains formal partnerships with the federal agencies that most directly affect member operations:

**U.S. Army Corps of Engineers (USACE)** — NAFSMA holds a Memorandum of Understanding with the Department of the Army for annual partnership meetings, collaborative policy development, and information exchange on flood risk management. Many NAFSMA member agencies serve as non-federal sponsors on USACE flood risk management projects.

**Federal Emergency Management Agency (FEMA)** — NAFSMA works closely with FEMA on the National Flood Insurance Program, Risk MAP flood mapping, and hazard mitigation grant programs that benefit member agency communities.

**Environmental Protection Agency (EPA)** — NAFSMA engages EPA on stormwater regulations, NPDES MS4 permits, and the Water Infrastructure Finance and Innovation Act (WIFIA) financing program.

## Our History

Founded in 1978, NAFSMA has advocated for public water resource agencies through every major flood policy development of the past four-and-a-half decades — from the National Flood Insurance Program to the Clean Water Act, from WRDA reauthorizations to the Infrastructure Investment and Jobs Act. Our institutional knowledge and long-standing federal relationships are among the most valuable benefits we offer member agencies.`)

  const policyContent = markdownToTipTap(`## Policy & Advocacy

NAFSMA advances federal policy on behalf of public flood control, stormwater, and water resource agencies. Our advocacy spans Congressional legislation, federal rulemaking, and administrative policy — with a track record of influencing the programs and regulations that most directly affect member agency operations.

## Our Advocacy Approach

NAFSMA advocates collaboratively rather than confrontationally — positioning member agencies as knowledgeable partners and problem-solvers rather than critics. We develop detailed, technically-grounded policy positions through member input and translate on-the-ground experience into legislative language and regulatory comments that federal decision-makers trust.

Our advocacy mechanisms include:

- Direct meetings with Congressional committee staff and federal agency leadership
- Formal comment letters on proposed rules and regulations
- Position papers on key legislative and regulatory issues
- Committee testimony and participation in federal listening sessions
- Annual partnership meetings with USACE in Washington, DC

## Current Legislative Priorities

### WRDA 2026 — Water Resources Development Act

NAFSMA is actively engaged in the WRDA 2026 legislative cycle, developing provisions addressing alternative project delivery, real estate acquisition streamlining, Section 408 permitting reform, and technical review coordination. WRDA 2026 project request portals are open for member agency submissions.

### Federal Appropriations — FY26 Energy & Water

NAFSMA is monitoring and supporting the FY26 Energy & Water appropriations bill, which funds USACE civil works programs. Congressional appropriators have consistently maintained strong bipartisan support for water infrastructure funding.

### National Flood Insurance Program (NFIP)

NAFSMA supports NFIP reauthorization with provisions that improve affordability, strengthen mitigation, and ensure the program works effectively for the communities our members serve.

## Regulatory Issues

### WOTUS — Waters of the United States

NAFSMA is engaged in EPA's WOTUS rulemaking, which determines the scope of Clean Water Act jurisdiction. Clarification of WOTUS definitions directly affects member agency maintenance and construction activities.

### Endangered Species Act (ESA)

NAFSMA is monitoring ESA consultation rulemaking that affects how federal agencies and non-federal sponsors approach project permitting.

### MS4 / NPDES Stormwater

NAFSMA engages EPA on Municipal Separate Storm Sewer System (MS4) permit requirements, advocating for flexible, cost-effective approaches that achieve water quality goals.`)

  const eventsContent = markdownToTipTap(`## Events & Education

NAFSMA connects member agencies with federal leaders and peer professionals through an annual conference, monthly webinars, and expert mentoring sessions — providing direct access to the people and information that matter most to water resource agencies.

## 2026 Annual Meeting

**Dates:** July 13-16, 2026
**Location:** Annapolis, Maryland
**Registration:** Opens January 2026

The NAFSMA Annual Meeting brings together 200+ professionals from local, regional, and state water resource agencies with leaders from USACE, FEMA, and EPA. Over four days, attendees engage in high-level policy discussions, agency roundtables, committee meetings, and networking with peers navigating the same federal partnership challenges.

## Members-Only Webinars

NAFSMA hosts regular members-only webinars throughout the year, featuring direct briefings from USACE, FEMA, and EPA administrators on current policy, regulatory developments, and program updates. These calls provide an unmatched direct line of communication with federal leadership.

## Mentoring Sessions

NAFSMA's expert-led mentoring sessions bring together curated groups of academics, federal experts, and senior practitioners for focused deep dives on emerging technical and policy topics. Recent sessions have covered:

- Future of Flood Risk Data
- Flood Evacuation and Real-Time Forecasting
- Induced Flooding
- Innovation and AI in Water Management
- Environmental Permitting`)

  const annualMeetingContent = markdownToTipTap(`## NAFSMA 2026 Annual Meeting

**July 13-16, 2026 | Annapolis, Maryland**

The NAFSMA Annual Meeting brings together 200+ professionals from local, regional, and state water resource agencies with leaders from USACE, FEMA, and EPA. Over four days, attendees engage in high-level policy discussions, agency roundtables, committee meetings, and networking with peers navigating the same federal partnership challenges.

## What to Expect

- High-level briefings from USACE, FEMA, and EPA senior leadership
- Policy roundtables on WRDA 2026, federal appropriations, and regulatory developments
- Committee meetings where members shape NAFSMA's advocacy positions
- Networking with 200+ water resource professionals from across the country
- Technical sessions on emerging flood and stormwater management topics

## Registration

Registration opens January 2026. NAFSMA member agencies receive discounted registration rates.`)

  const awardsContent = markdownToTipTap(`## NAFSMA Awards Program

Each year, NAFSMA recognizes outstanding achievements in water resource management through two prestigious awards. These awards celebrate innovation, leadership, and excellence — and serve as platforms to share successful models with agencies nationwide.

## Award Categories

### Innovative Water Projects Award

Recognizes projects that achieve multiple benefits — combining flood protection with ecological restoration, recreation, environmental benefits, and community value. These projects demonstrate the best of what water resource agencies can accomplish when creativity meets technical excellence.

### Excellence in Communications Award

Recognizes exceptional communication programs in flood and emergency preparedness OR water quality — honoring agencies that effectively engage and inform their communities about water resource challenges and solutions.

Awards are open to both NAFSMA members and non-members.

## 2025 Award Winners

**Innovative Water Projects Award:** McLoud Run — City of Cedar Rapids, Iowa

This multi-benefit project demonstrates how flood protection can enhance communities through habitat restoration, recreation, and environmental stewardship. The McLoud Run project is a model for water resource agencies nationwide.

**Special Recognition:** City of Houston Stormwater Master Plan

Houston's comprehensive stormwater planning effort received special recognition for its scale, innovation, and commitment to community-centered flood solutions.

## Apply or Nominate

Applications open March 1 each year. The deadline is July 31. Learn more about the judging criteria and submit your application.`)

  const membershipContent = markdownToTipTap(`## Join NAFSMA — Your Federal Advocacy Partner

When your agency joins NAFSMA, you join more than an association — you join a community of support. For more than 46 years, NAFSMA has been built from the ground up to benefit public flood control, stormwater, and water resource agencies. Our members have a direct line to federal decision-makers at USACE, FEMA, and EPA, and a collective voice that shapes the policies affecting their operations and communities.

## Why Join NAFSMA

### Federal Access — Unmatched

NAFSMA members receive exclusive access to briefings, roundtables, and webinars with senior leadership from USACE, FEMA, and EPA. This direct engagement is not available through any other channel. Our Annual Partnership Meeting with USACE in Washington, DC, provides a structured forum for member agencies to raise priorities directly with Army civil works leadership.

### Policy Intelligence — Stay Ahead of Change

Federal policy changes quickly. NAFSMA members receive timely policy alerts, detailed newsletter coverage of legislative and regulatory developments, and expert analysis of how changes affect agency operations. Our bill tracker, comment letter summaries, and regulatory roundups keep member agencies informed before changes take effect.

### Community of Peers — You're Not Alone

Water resource agencies face complex, often unprecedented challenges — from encampments on levees to PFAS in stormwater, from budget pressures to changing federal permitting requirements. NAFSMA connects member agency leaders with peers who have navigated similar challenges, creating a trusted network of practitioners who share knowledge and support each other's work.

### Collective Advocacy — Stronger Together

NAFSMA translates member agency experience into federal policy. Our comment letters, position papers, and Congressional briefings carry the weight of the practitioners who operate and maintain America's flood protection infrastructure. Individual agencies rarely have the bandwidth or Washington relationships to advocate effectively alone. NAFSMA makes your voice heard.

## How to Join

1. **Review membership categories** — Determine whether your organization qualifies as a Member Agency or Associate Member
2. **Complete the application** — Fill out our online membership form
3. **Submit payment** — Invoice will be issued; dues are payable annually
4. **Get connected** — You'll receive access to the member resource portal, newsletter subscription, and upcoming event invitations within 5 business days

Questions? Contact Sunny Simpkins at sunnys@nafsma.org or (202) 289-8625.`)

  const contactContent = markdownToTipTap(`## Contact NAFSMA

**Executive Director**
Sunny Simpkins
sunnys@nafsma.org
(202) 289-8625

**Operations**
Jennifer Cole, Director of Operations
jennifer@nafsma.org

**Mailing Address**
National Association of Flood & Stormwater Management Agencies
P.O. Box 4336
Silver Spring, MD 20914

**Website:** www.nafsma.org`)

  const faqPageContent = markdownToTipTap(`## Frequently Asked Questions

Find answers to common questions about NAFSMA, membership, federal programs, events, and resources. If you don't find what you're looking for, please contact us.`)

  const privacyContent = markdownToTipTap(`## Privacy Policy

NAFSMA is committed to protecting the privacy of our members and website visitors. This policy outlines how we collect, use, and safeguard your information.

### Information We Collect

We collect information you provide directly to us, such as when you fill out a membership application, register for an event, subscribe to our newsletter, or contact us.

### How We Use Your Information

We use the information we collect to provide membership services, communicate policy updates and event information, process registrations and applications, and improve our website and services.

### Data Protection

We implement appropriate security measures to protect your personal information. We do not sell, trade, or rent your personal information to third parties.

### Contact

For questions about this privacy policy, contact us at info@nafsma.org.`)

  const pastWinnersContent = markdownToTipTap(`## Past Award Winners

NAFSMA has recognized outstanding achievements in water resource management since the awards program's inception. Browse past winners by year to see the innovative projects and communications programs that have set the standard for our industry.`)

  const awardApplyContent = markdownToTipTap(`## Apply for a NAFSMA Award

Applications open March 1 each year. The deadline is July 31.

### Innovative Water Projects Award

Submit projects that achieve multiple benefits — combining flood protection with ecological restoration, recreation, environmental benefits, and community value.

### Excellence in Communications Award

Submit communication programs in flood and emergency preparedness or water quality that effectively engage and inform communities.

Awards are open to both NAFSMA members and non-members.`)

  const staffContent = markdownToTipTap(`## NAFSMA Staff

Meet the team that drives NAFSMA's mission forward — advocating for public flood control, stormwater, and water resource agencies at the federal level.`)

  const boardContent = markdownToTipTap(`## Board of Directors

NAFSMA's Board of Directors comprises experienced water resource professionals from member agencies across the country. The board provides strategic direction and governance oversight, ensuring NAFSMA's advocacy and programs serve the interests of public flood and stormwater management agencies nationwide.`)

  const pages = [
    {
      title: 'About — Who We Are',
      slug: 'about',
      template: 'about',
      content: aboutContent,
      seoTitle: 'About NAFSMA — National Association of Flood & Stormwater Management Agencies',
      seoDescription: 'Learn about NAFSMA, the national nonprofit representing public flood control, stormwater, and water resource agencies. 46+ years of federal advocacy with USACE, FEMA, and EPA.',
    },
    {
      title: 'Staff',
      slug: 'about/staff',
      template: 'staff',
      content: staffContent,
      seoTitle: 'NAFSMA Staff — Leadership Team',
      seoDescription: 'Meet the NAFSMA staff driving federal advocacy for public flood control and stormwater management agencies.',
    },
    {
      title: 'Board of Directors',
      slug: 'about/board',
      template: 'board',
      content: boardContent,
      seoTitle: 'NAFSMA Board of Directors',
      seoDescription: 'NAFSMA Board of Directors — experienced water resource professionals providing strategic direction for flood and stormwater policy advocacy.',
    },
    {
      title: 'Policy & Advocacy',
      slug: 'policy',
      template: 'policy',
      content: policyContent,
      seoTitle: 'Policy & Advocacy — NAFSMA Federal Flood and Stormwater Policy',
      seoDescription: 'NAFSMA advances federal policy for public flood control and stormwater agencies. Track WRDA 2026, federal appropriations, NFIP, and regulatory issues.',
    },
    {
      title: 'Events & Education',
      slug: 'events',
      template: 'events',
      content: eventsContent,
      seoTitle: 'Events & Education — NAFSMA Conferences, Webinars, Mentoring',
      seoDescription: 'Connect with federal leaders at NAFSMA events. Annual Meeting, members-only webinars with USACE, FEMA, EPA, and expert mentoring sessions.',
    },
    {
      title: 'Annual Meeting 2026',
      slug: 'events/annual-meeting-2026',
      template: 'event-detail',
      content: annualMeetingContent,
      seoTitle: '2026 NAFSMA Annual Meeting — July 13-16, Annapolis, Maryland',
      seoDescription: 'Join 200+ water resource professionals and federal leaders from USACE, FEMA, and EPA at the NAFSMA 2026 Annual Meeting in Annapolis, Maryland.',
    },
    {
      title: 'Awards Program',
      slug: 'awards',
      template: 'awards',
      content: awardsContent,
      seoTitle: 'NAFSMA Awards Program — Innovative Water Projects & Communications Excellence',
      seoDescription: 'NAFSMA recognizes outstanding achievements in water resource management through the Innovative Water Projects Award and Excellence in Communications Award.',
    },
    {
      title: 'Past Award Winners',
      slug: 'awards/past-winners',
      template: 'awards-archive',
      content: pastWinnersContent,
      seoTitle: 'Past NAFSMA Award Winners',
      seoDescription: 'Browse past winners of the NAFSMA Innovative Water Projects Award and Excellence in Communications Award.',
    },
    {
      title: 'Award Application',
      slug: 'awards/apply',
      template: 'awards-apply',
      content: awardApplyContent,
      seoTitle: 'Apply for a NAFSMA Award',
      seoDescription: 'Apply for the NAFSMA Innovative Water Projects Award or Excellence in Communications Award. Applications open March 1, deadline July 31.',
    },
    {
      title: 'Membership',
      slug: 'membership',
      template: 'membership',
      content: membershipContent,
      seoTitle: 'Join NAFSMA — Membership for Public Water Resource Agencies',
      seoDescription: 'Join NAFSMA for direct access to USACE, FEMA, and EPA leadership, timely policy intelligence, and a community of peer water resource agencies.',
    },
    {
      title: 'Contact',
      slug: 'contact',
      template: 'contact',
      content: contactContent,
      seoTitle: 'Contact NAFSMA',
      seoDescription: 'Contact NAFSMA — Executive Director Sunny Simpkins, (202) 289-8625, sunnys@nafsma.org. P.O. Box 4336, Silver Spring, MD 20914.',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy',
      template: 'default',
      content: privacyContent,
      seoTitle: 'Privacy Policy — NAFSMA',
      seoDescription: 'NAFSMA privacy policy — how we collect, use, and protect your information.',
    },
    {
      title: 'FAQ',
      slug: 'faq',
      template: 'faq',
      content: faqPageContent,
      seoTitle: 'FAQ — NAFSMA Frequently Asked Questions',
      seoDescription: 'Answers to common questions about NAFSMA membership, federal programs, events, resources, and how to contact us.',
    },
  ]

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        ...page,
        status: 'PUBLISHED',
        authorId: admin.id,
        publishedAt: new Date(),
      },
    })
  }

  console.log(`    ✓ ${pages.length} pages seeded with real content`)
}
