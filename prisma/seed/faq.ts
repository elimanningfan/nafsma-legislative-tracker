import { PrismaClient } from '@prisma/client'

export async function seedFaq(prisma: PrismaClient) {
  console.log('  Seeding FAQ...')

  // Placeholder — content-seeder will populate from faq-content.md
  const faqs = [
    {
      question: 'What is NAFSMA?',
      answer: 'NAFSMA is the National Association of Flood & Stormwater Management Agencies, a nonprofit trade association representing public agencies responsible for flood and stormwater management.',
      category: 'GENERAL' as const,
      displayOrder: 1,
    },
    {
      question: 'Who can join NAFSMA?',
      answer: 'Any public agency with responsibilities for flood control, stormwater management, or related water resources activities is eligible for agency membership. Private firms providing services to these agencies can join as associate members.',
      category: 'MEMBERSHIP' as const,
      displayOrder: 1,
    },
  ]

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq })
  }

  console.log(`    ✓ ${faqs.length} FAQ items seeded`)
}
