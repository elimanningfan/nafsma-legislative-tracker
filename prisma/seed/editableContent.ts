import { PrismaClient } from '@prisma/client'

export async function seedEditableContent(prisma: PrismaClient) {
  console.log('  Seeding editable content...')

  // Placeholder — content-seeder agent will populate with approved copy
  const items = [
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
      content: 'For 46+ years, NAFSMA has been the voice of public flood and stormwater agencies in Washington, D.C.',
      contentType: 'text',
      order: 2,
    },
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
      content: 'Years of Advocacy',
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
      content: 'Member Agencies',
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
      content: 'Federal Partners',
      contentType: 'text',
      order: 6,
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
