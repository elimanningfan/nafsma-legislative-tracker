import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function seedUsers(prisma: PrismaClient) {
  console.log('  Seeding users...')

  const defaultPassword = await bcrypt.hash('nafsma2026!', 12)

  const users = [
    {
      name: 'Sunny Simpkins',
      email: 'sunny@nafsma.org',
      password: defaultPassword,
      role: 'ADMIN' as const,
      title: 'Executive Director',
    },
    {
      name: 'Jennifer Cole',
      email: 'jennifer@nafsma.org',
      password: defaultPassword,
      role: 'ADMIN' as const,
      title: 'Director of Operations',
    },
    {
      name: 'Susan Gilson',
      email: 'susan@nafsma.org',
      password: defaultPassword,
      role: 'EDITOR' as const,
      title: 'Senior Policy Advisor',
    },
    {
      name: 'Jon Davis',
      email: 'jon@nafsma.org',
      password: defaultPassword,
      role: 'ADMIN' as const,
      title: 'AI Consultant',
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log(`    ✓ ${users.length} users seeded`)
}
