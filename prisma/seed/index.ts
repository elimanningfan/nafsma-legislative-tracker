import { PrismaClient } from '@prisma/client'
import { seedUsers } from './users'
import { seedSettings } from './settings'
import { seedNavigation } from './navigation'
import { seedPages } from './pages'
import { seedEditableContent } from './editableContent'
import { seedBlog } from './blog'
import { seedEvents } from './events'
import { seedFaq } from './faq'
import { seedTemplates } from './templates'
import { seedAwards } from './awards'
import { seedResources } from './resources'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting NAFSMA database seed...\n')

  // Order matters — users first (other models reference them)
  await seedUsers(prisma)
  await seedSettings(prisma)
  await seedNavigation(prisma)
  await seedPages(prisma)
  await seedEditableContent(prisma)
  await seedBlog(prisma)
  await seedEvents(prisma)
  await seedFaq(prisma)
  await seedTemplates(prisma)
  await seedAwards(prisma)
  await seedResources(prisma)

  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
