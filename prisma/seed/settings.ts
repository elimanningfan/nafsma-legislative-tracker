import { PrismaClient } from '@prisma/client'

export async function seedSettings(prisma: PrismaClient) {
  console.log('  Seeding site settings...')

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'NAFSMA',
      tagline: 'Driving flood and stormwater policy that benefits our communities',
      contactEmail: 'info@nafsma.org',
      contactPhone: '(202) 289-8625',
      address: 'Washington, DC',
      socialMedia: {
        linkedin: 'https://www.linkedin.com/company/nafsma',
      },
      colors: {
        primary: '#1B4B82',
        teal: '#2A8080',
        lightBlue: '#EBF4FA',
        warmGray: '#4A4A4A',
        darkNavy: '#0D2B4E',
      },
      featureFlags: {
        memberPortal: true,
        aiContentGeneration: true,
        billTracker: false,
      },
    },
  })

  console.log('    ✓ Site settings seeded')
}
