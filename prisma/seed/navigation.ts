import { PrismaClient } from '@prisma/client'

export async function seedNavigation(prisma: PrismaClient) {
  console.log('  Seeding navigation...')

  // Clear existing navigation
  await prisma.navigationItem.deleteMany()

  const navItems = [
    // Main nav
    { label: 'About', href: '/about', menuGroup: 'main', displayOrder: 1 },
    { label: 'Who We Are', href: '/about', menuGroup: 'main', parentId: 'about', displayOrder: 1 },
    { label: 'Staff', href: '/about/staff', menuGroup: 'main', parentId: 'about', displayOrder: 2 },
    { label: 'Board of Directors', href: '/about/board', menuGroup: 'main', parentId: 'about', displayOrder: 3 },

    { label: 'Membership', href: '/membership', menuGroup: 'main', displayOrder: 2 },
    { label: 'Why Join', href: '/membership', menuGroup: 'main', parentId: 'membership', displayOrder: 1 },
    { label: 'Apply', href: '/membership/join', menuGroup: 'main', parentId: 'membership', displayOrder: 2 },

    { label: 'Policy & Advocacy', href: '/policy', menuGroup: 'main', displayOrder: 3 },

    { label: 'Events', href: '/events', menuGroup: 'main', displayOrder: 4 },
    { label: 'Annual Meeting 2026', href: '/events/annual-meeting-2026', menuGroup: 'main', parentId: 'events', displayOrder: 1 },

    { label: 'Resources', href: '/resources', menuGroup: 'main', displayOrder: 5 },

    { label: 'Awards', href: '/awards', menuGroup: 'main', displayOrder: 6 },
    { label: 'Past Winners', href: '/awards/past-winners', menuGroup: 'main', parentId: 'awards', displayOrder: 1 },
    { label: 'Apply', href: '/awards/apply', menuGroup: 'main', parentId: 'awards', displayOrder: 2 },

    { label: 'News', href: '/news', menuGroup: 'main', displayOrder: 7 },
    { label: 'Contact', href: '/contact', menuGroup: 'main', displayOrder: 8 },

    // Footer nav
    { label: 'About', href: '/about', menuGroup: 'footer', displayOrder: 1 },
    { label: 'Membership', href: '/membership', menuGroup: 'footer', displayOrder: 2 },
    { label: 'Policy & Advocacy', href: '/policy', menuGroup: 'footer', displayOrder: 3 },
    { label: 'Events', href: '/events', menuGroup: 'footer', displayOrder: 4 },
    { label: 'Awards', href: '/awards', menuGroup: 'footer', displayOrder: 5 },
    { label: 'News', href: '/news', menuGroup: 'footer', displayOrder: 6 },
    { label: 'Contact', href: '/contact', menuGroup: 'footer', displayOrder: 7 },
    { label: 'Privacy Policy', href: '/privacy', menuGroup: 'footer', displayOrder: 8 },
    { label: 'FAQ', href: '/faq', menuGroup: 'footer', displayOrder: 9 },
  ]

  for (const item of navItems) {
    const { parentId, ...data } = item as any
    await prisma.navigationItem.create({ data })
  }

  console.log(`    ✓ ${navItems.length} navigation items seeded`)
}
