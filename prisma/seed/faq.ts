import { PrismaClient } from '@prisma/client'

export async function seedFaq(prisma: PrismaClient) {
  console.log('  Seeding FAQ...')

  const faqs = [
    // ============================================================
    // GENERAL
    // ============================================================
    {
      question: 'What is NAFSMA?',
      answer: 'NAFSMA — the National Association of Flood & Stormwater Management Agencies — is a national nonprofit representing public agencies responsible for flood risk management and stormwater management across the United States. Founded in 1978, NAFSMA advocates at the federal level on behalf of flood control districts, stormwater utilities, state agencies, and municipal public works departments.',
      category: 'GENERAL' as const,
      displayOrder: 1,
    },
    {
      question: 'Who does NAFSMA represent?',
      answer: 'NAFSMA represents public agencies whose function is the protection of lives, property, and economic activity from flood and stormwater. This includes flood control districts, stormwater utilities, drainage districts, conservancy districts, and state-level water resource agencies. Private sector firms in engineering, consulting, legal, and technology can join as Associate Members.',
      category: 'GENERAL' as const,
      displayOrder: 2,
    },
    {
      question: 'Where is NAFSMA headquartered?',
      answer: 'NAFSMA is headquartered in Silver Spring, Maryland, in the Washington, DC metropolitan area. Our Washington location gives us direct access to federal agencies and Congressional offices.',
      category: 'GENERAL' as const,
      displayOrder: 3,
    },
    {
      question: 'Is NAFSMA a government agency?',
      answer: 'No. NAFSMA is a 501(c)(6) nonprofit membership association. We represent public agencies but are not a government entity. We advocate to Congress and federal agencies on behalf of our members.',
      category: 'GENERAL' as const,
      displayOrder: 4,
    },

    // ============================================================
    // MEMBERSHIP
    // ============================================================
    {
      question: 'Who is eligible to join as a Member Agency?',
      answer: 'Public agencies responsible for flood risk management and stormwater management — including flood control districts, stormwater utilities, drainage districts, conservancy districts, reclamation districts, and state water resource agencies. Eligibility is based on your agency\'s public mission, not geographic location.',
      category: 'MEMBERSHIP' as const,
      displayOrder: 1,
    },
    {
      question: 'Who is eligible to join as an Associate Member?',
      answer: 'Private sector firms that work in the flood and stormwater sector — engineering firms, consulting firms, law firms, technology companies, and other organizations — may join as Associate Members.',
      category: 'MEMBERSHIP' as const,
      displayOrder: 2,
    },
    {
      question: 'How are member agency dues calculated?',
      answer: 'Member agency dues are tiered by the population served by your agency — not by budget, staff size, or jurisdiction area. See the Membership page for the full dues schedule.',
      category: 'MEMBERSHIP' as const,
      displayOrder: 3,
    },
    {
      question: 'How do I apply for membership?',
      answer: 'Complete the online membership application on our Membership page. You\'ll receive a dues invoice and be connected to member resources within 5 business days of approval.',
      category: 'MEMBERSHIP' as const,
      displayOrder: 4,
    },
    {
      question: 'Can a member attend the Annual Meeting without paying extra?',
      answer: 'Annual Meeting registration is separate from membership dues. Membership does provide discounted rates for the Annual Meeting and other NAFSMA events.',
      category: 'MEMBERSHIP' as const,
      displayOrder: 5,
    },

    // ============================================================
    // FEDERAL_PROGRAMS
    // ============================================================
    {
      question: 'What is WRDA?',
      answer: 'The Water Resources Development Act (WRDA) is a biennial law authorizing water resources infrastructure projects and policies by the U.S. Army Corps of Engineers. NAFSMA actively engages in each WRDA cycle to advance provisions that benefit member agencies and streamline federal-local project delivery.',
      category: 'FEDERAL_PROGRAMS' as const,
      displayOrder: 1,
    },
    {
      question: 'What is Section 408?',
      answer: 'Section 408 of the Rivers and Harbors Act requires USACE permission before a non-federal entity can alter, improve, or modify a USACE civil works project — including levees and channels. NAFSMA has advocated extensively to streamline the Section 408 process, which has historically caused significant delays for member agency projects.',
      category: 'FEDERAL_PROGRAMS' as const,
      displayOrder: 2,
    },
    {
      question: 'What is WIFIA?',
      answer: 'The Water Infrastructure Finance and Innovation Act (WIFIA) program provides low-cost federal loans for water and wastewater infrastructure projects. NAFSMA advocates for expanded WIFIA eligibility to cover stormwater and flood control infrastructure projects.',
      category: 'FEDERAL_PROGRAMS' as const,
      displayOrder: 3,
    },
    {
      question: 'What is WOTUS?',
      answer: '"Waters of the United States" (WOTUS) is a regulatory term defining which water bodies are subject to federal jurisdiction under the Clean Water Act. The definition has been revised multiple times and affects what activities require federal permits — with direct implications for member agency operations.',
      category: 'FEDERAL_PROGRAMS' as const,
      displayOrder: 4,
    },
    {
      question: 'What is Risk Rating 2.0?',
      answer: 'Risk Rating 2.0 is FEMA\'s updated method for pricing National Flood Insurance Program (NFIP) policies, implemented in 2021. The new methodology uses more data sources and property-specific risk factors instead of flood zone maps alone. NAFSMA has engaged on the implementation and ongoing effects on policyholders in member agency communities.',
      category: 'FEDERAL_PROGRAMS' as const,
      displayOrder: 5,
    },
    {
      question: 'What is CRS?',
      answer: 'The Community Rating System (CRS) is a voluntary FEMA program that rewards communities for flood risk management activities beyond minimum NFIP requirements. Participating communities earn discounts on NFIP flood insurance premiums for their residents. NAFSMA engages with FEMA on CRS program design and scoring.',
      category: 'FEDERAL_PROGRAMS' as const,
      displayOrder: 6,
    },

    // ============================================================
    // EVENTS
    // ============================================================
    {
      question: 'How do I register for NAFSMA webinars?',
      answer: 'Members receive registration links via the NAFSMA newsletter and policy alerts. Webinar registration links are also posted in the Member Resources section of the website. Contact jennifer@nafsma.org if you need assistance.',
      category: 'EVENTS' as const,
      displayOrder: 1,
    },
    {
      question: 'Who speaks at NAFSMA webinars?',
      answer: 'NAFSMA webinars feature senior leadership from USACE, FEMA, and EPA — including program managers, division directors, and administrators — along with technical experts and member agency practitioners. These are substantive briefings, not sales presentations.',
      category: 'EVENTS' as const,
      displayOrder: 2,
    },
    {
      question: 'When and where is the 2026 Annual Meeting?',
      answer: 'The 2026 Annual Meeting will be held July 13-16, 2026, in Annapolis, Maryland. Registration opens January 2026.',
      category: 'EVENTS' as const,
      displayOrder: 3,
    },
    {
      question: 'Are Annual Meeting sessions recorded?',
      answer: 'Select sessions are recorded and made available to registered attendees and members through the Member Resources portal.',
      category: 'EVENTS' as const,
      displayOrder: 4,
    },

    // ============================================================
    // RESOURCES
    // ============================================================
    {
      question: 'What resources are available in the Member Portal?',
      answer: 'The Member Resources portal includes monthly newsletters, webinar recordings, committee meeting notes, position papers, advocacy guides, federal program summaries, and Annual Meeting presentations.',
      category: 'RESOURCES' as const,
      displayOrder: 1,
    },
    {
      question: 'Are NAFSMA position papers publicly available?',
      answer: 'Many NAFSMA position papers, comment letters, and advocacy guides are publicly available on the Policy & Advocacy page. Some resources are exclusive to members and accessible only through the Member Portal.',
      category: 'RESOURCES' as const,
      displayOrder: 2,
    },
    {
      question: 'How do I access the Member Portal?',
      answer: 'Member Portal access is provided when your membership is confirmed. Contact jennifer@nafsma.org for login assistance.',
      category: 'RESOURCES' as const,
      displayOrder: 3,
    },

    // ============================================================
    // CONTACT
    // ============================================================
    {
      question: 'How do I reach NAFSMA staff?',
      answer: 'Executive Director: Sunny Simpkins — sunnys@nafsma.org | (202) 289-8625. Director of Operations: Jennifer Cole — jennifer@nafsma.org. Mailing Address: P.O. Box 4336, Silver Spring, MD 20914.',
      category: 'CONTACT' as const,
      displayOrder: 1,
    },
  ]

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq })
  }

  console.log(`    ✓ ${faqs.length} FAQ items seeded`)
}
