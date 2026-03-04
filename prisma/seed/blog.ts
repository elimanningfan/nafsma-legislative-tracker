import { PrismaClient } from '@prisma/client'
import { markdownToTipTap } from './utils'

export async function seedBlog(prisma: PrismaClient) {
  console.log('  Seeding blog categories, tags, and posts...')

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('No admin user found')

  const categories = [
    { name: 'Policy Updates', slug: 'policy-updates', color: '#1B4B82' },
    { name: 'Legislative News', slug: 'legislative-news', color: '#2A8080' },
    { name: 'Member Spotlight', slug: 'member-spotlight', color: '#0D2B4E' },
    { name: 'Events', slug: 'events', color: '#4A4A4A' },
    { name: 'Resources', slug: 'resources', color: '#1B4B82' },
    { name: 'Awards', slug: 'awards', color: '#2A8080' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  const tags = [
    'WRDA', 'NFIP', 'FEMA', 'EPA', 'USACE',
    'Stormwater', 'Infrastructure', 'Climate',
    'Appropriations', 'Clean Water', 'Flood Risk',
  ]

  for (const tagName of tags) {
    const slug = tagName.toLowerCase().replace(/\s+/g, '-')
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name: tagName, slug },
    })
  }

  // Sample blog posts with real policy content
  const policyCategory = await prisma.category.findUnique({ where: { slug: 'policy-updates' } })
  const awardsCategory = await prisma.category.findUnique({ where: { slug: 'awards' } })

  const post1Content = markdownToTipTap(`NAFSMA is actively engaged in the WRDA 2026 legislative cycle, working with Congressional committee staff to develop provisions that address the most pressing project delivery challenges facing member agencies.

## Key Provisions Under Development

NAFSMA's WRDA 2026 advocacy focuses on several critical areas:

**Alternative Project Delivery** — Expanding authorities for non-federal sponsors to advance project components ahead of the traditional federal timeline, reducing delays that have historically extended project completion by years.

**Section 408 Permitting Reform** — Streamlining the process by which non-federal entities seek USACE permission to modify civil works projects. The current Section 408 review process has caused significant delays for member agency maintenance and improvement projects.

**Real Estate Acquisition** — Simplifying federal requirements for land acquisition that have created bottlenecks in project delivery for non-federal sponsors.

**Technical Review Coordination** — Improving coordination between USACE district offices and non-federal sponsors during project review to reduce redundant review cycles.

## What Member Agencies Should Know

WRDA 2026 project request portals are open for member agency submissions. Agencies with authorized or pending USACE projects should review current provisions and identify opportunities to address project-specific challenges through legislative language.

NAFSMA's Legislative Committee is coordinating member agency input and developing detailed provision language for Congressional consideration. Contact NAFSMA staff to discuss your agency's WRDA priorities.`)

  const post2Content = markdownToTipTap(`NAFSMA recognizes the City of Cedar Rapids, Iowa, with the 2025 Innovative Water Projects Award for the McLoud Run Flood Mitigation Project.

## About the Project

The McLoud Run project transformed a flood-prone corridor in Cedar Rapids into an integrated system that combines engineered flood mitigation with community amenities. The project demonstrates that flood infrastructure investment can deliver value far beyond damage reduction.

Key project elements include:

- Engineered flood storage and conveyance improvements to reduce flood risk for surrounding neighborhoods
- Restored wetland areas that provide natural flood attenuation and water quality treatment
- Recreational trails connecting neighborhoods to the restored corridor
- Native habitat restoration supporting local ecological systems

## Why It Matters

Cedar Rapids has emerged as a national leader in flood resilience since the devastating 2008 floods. The McLoud Run project represents the city's commitment to building back better — designing flood infrastructure that serves multiple community needs simultaneously.

For NAFSMA member agencies evaluating their own infrastructure investments, McLoud Run offers a replicable model: engage the community early, design for multiple benefits, and measure success beyond engineering performance alone.

## Apply for the 2026 Awards

NAFSMA's awards program is open to both member and non-member agencies. Applications open March 1, with a July 31 deadline. Learn more on the Awards page.`)

  await prisma.blogPost.upsert({
    where: { slug: 'wrda-2026-legislative-priorities' },
    update: {},
    create: {
      title: 'WRDA 2026: NAFSMA Advances Key Project Delivery Provisions',
      slug: 'wrda-2026-legislative-priorities',
      content: post1Content,
      excerpt: 'NAFSMA is working with Congressional committee staff on WRDA 2026 provisions addressing alternative project delivery, Section 408 reform, and real estate acquisition streamlining.',
      status: 'PUBLISHED',
      featured: true,
      readingTime: 4,
      seoTitle: 'WRDA 2026 Legislative Priorities — NAFSMA Policy Update',
      seoDescription: 'NAFSMA advances WRDA 2026 provisions on alternative project delivery, Section 408 permitting reform, and real estate acquisition streamlining for member agencies.',
      authorId: admin.id,
      categoryId: policyCategory?.id,
      publishedAt: new Date('2026-02-15'),
    },
  })

  await prisma.blogPost.upsert({
    where: { slug: '2025-innovative-water-projects-award-mcloud-run' },
    update: {},
    create: {
      title: '2025 Innovative Water Projects Award: McLoud Run — Cedar Rapids, Iowa',
      slug: '2025-innovative-water-projects-award-mcloud-run',
      content: post2Content,
      excerpt: 'NAFSMA recognizes the City of Cedar Rapids with the 2025 Innovative Water Projects Award for the McLoud Run Flood Mitigation Project — a multi-benefit model for water resource agencies.',
      status: 'PUBLISHED',
      featured: false,
      readingTime: 3,
      seoTitle: '2025 NAFSMA Innovative Water Projects Award — McLoud Run, Cedar Rapids',
      seoDescription: 'Cedar Rapids receives the 2025 NAFSMA Innovative Water Projects Award for the McLoud Run Flood Mitigation Project combining flood protection with habitat restoration and recreation.',
      authorId: admin.id,
      categoryId: awardsCategory?.id,
      publishedAt: new Date('2025-11-01'),
    },
  })

  // Connect tags to posts
  const wrdaPost = await prisma.blogPost.findUnique({ where: { slug: 'wrda-2026-legislative-priorities' } })
  const awardPost = await prisma.blogPost.findUnique({ where: { slug: '2025-innovative-water-projects-award-mcloud-run' } })
  const wrdaTag = await prisma.tag.findUnique({ where: { slug: 'wrda' } })
  const usaceTag = await prisma.tag.findUnique({ where: { slug: 'usace' } })
  const infraTag = await prisma.tag.findUnique({ where: { slug: 'infrastructure' } })
  const floodRiskTag = await prisma.tag.findUnique({ where: { slug: 'flood-risk' } })

  if (wrdaPost && wrdaTag) {
    await prisma.blogPostTag.upsert({
      where: { postId_tagId: { postId: wrdaPost.id, tagId: wrdaTag.id } },
      update: {},
      create: { postId: wrdaPost.id, tagId: wrdaTag.id },
    })
  }
  if (wrdaPost && usaceTag) {
    await prisma.blogPostTag.upsert({
      where: { postId_tagId: { postId: wrdaPost.id, tagId: usaceTag.id } },
      update: {},
      create: { postId: wrdaPost.id, tagId: usaceTag.id },
    })
  }
  if (awardPost && floodRiskTag) {
    await prisma.blogPostTag.upsert({
      where: { postId_tagId: { postId: awardPost.id, tagId: floodRiskTag.id } },
      update: {},
      create: { postId: awardPost.id, tagId: floodRiskTag.id },
    })
  }
  if (awardPost && infraTag) {
    await prisma.blogPostTag.upsert({
      where: { postId_tagId: { postId: awardPost.id, tagId: infraTag.id } },
      update: {},
      create: { postId: awardPost.id, tagId: infraTag.id },
    })
  }

  console.log(`    ✓ ${categories.length} categories, ${tags.length} tags, 2 blog posts seeded`)
}
