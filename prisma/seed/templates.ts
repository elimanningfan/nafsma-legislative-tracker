import { PrismaClient } from '@prisma/client'

export async function seedTemplates(prisma: PrismaClient) {
  console.log('  Seeding AI content templates...')

  // Placeholder — content-seeder will populate full system prompts
  const templates = [
    {
      name: 'Blog: Policy Update',
      type: 'BLOG_POLICY',
      description: 'Policy update blog post — what happened, why it matters, what to do',
      systemPrompt: 'You are a content writer for NAFSMA. Write a policy update blog post.',
      generationParams: { temperature: 0.7, maxTokens: 2000 },
    },
    {
      name: 'Blog: Member Spotlight',
      type: 'BLOG_SPOTLIGHT',
      description: 'Celebratory member spotlight — specific, best-practice focused',
      systemPrompt: 'You are a content writer for NAFSMA. Write a member spotlight post.',
      generationParams: { temperature: 0.7, maxTokens: 1500 },
    },
    {
      name: 'Blog: Event Announcement',
      type: 'BLOG_EVENT',
      description: 'Engaging event announcement with federal access angle',
      systemPrompt: 'You are a content writer for NAFSMA. Write an event announcement.',
      generationParams: { temperature: 0.7, maxTokens: 1000 },
    },
    {
      name: 'Newsletter Section',
      type: 'NEWSLETTER',
      description: 'Structured: headline, what, why, what\'s next',
      systemPrompt: 'You are a content writer for NAFSMA. Write a newsletter section.',
      generationParams: { temperature: 0.7, maxTokens: 800 },
    },
    {
      name: 'LinkedIn Post',
      type: 'LINKEDIN',
      description: 'Hook/body/CTA, 150-300 words, no emoji',
      systemPrompt: 'You are a content writer for NAFSMA. Write a LinkedIn post.',
      generationParams: { temperature: 0.7, maxTokens: 500 },
    },
    {
      name: 'Policy Summary',
      type: 'POLICY_SUMMARY',
      description: '150 words, what/why/action framing',
      systemPrompt: 'You are a content writer for NAFSMA. Write a policy summary.',
      generationParams: { temperature: 0.5, maxTokens: 400 },
    },
    {
      name: 'Comment Letter Opening',
      type: 'COMMENT_LETTER',
      description: 'Formal, establish credibility, express appreciation',
      systemPrompt: 'You are a content writer for NAFSMA. Write a comment letter opening.',
      generationParams: { temperature: 0.5, maxTokens: 500 },
    },
    {
      name: 'Award Announcement',
      type: 'AWARD',
      description: '200 words, celebratory but substantive',
      systemPrompt: 'You are a content writer for NAFSMA. Write an award announcement.',
      generationParams: { temperature: 0.7, maxTokens: 400 },
    },
    {
      name: 'Membership Outreach Email',
      type: 'MEMBER_EMAIL',
      description: 'Peer-to-peer, not pushy',
      systemPrompt: 'You are a content writer for NAFSMA. Write a membership outreach email.',
      generationParams: { temperature: 0.7, maxTokens: 600 },
    },
    {
      name: 'Hero Headline',
      type: 'HERO_HEADLINE',
      description: 'Under 12 words + 2-3 sentence subheadline',
      systemPrompt: 'You are a content writer for NAFSMA. Generate a hero headline.',
      generationParams: { temperature: 0.8, maxTokens: 200 },
    },
    {
      name: 'Stats Copy',
      type: 'STATS_COPY',
      description: 'Concise labels (3-6 words) for stat bar',
      systemPrompt: 'You are a content writer for NAFSMA. Write stat bar copy.',
      generationParams: { temperature: 0.5, maxTokens: 200 },
    },
    {
      name: 'Newsletter Intro',
      type: 'NEWSLETTER_INTRO',
      description: '2-3 sentences, authoritative, connects topics',
      systemPrompt: 'You are a content writer for NAFSMA. Write a newsletter intro.',
      generationParams: { temperature: 0.7, maxTokens: 300 },
    },
  ]

  for (const template of templates) {
    await prisma.contentTemplate.upsert({
      where: { type: template.type },
      update: {},
      create: template,
    })
  }

  console.log(`    ✓ ${templates.length} AI templates seeded`)
}
