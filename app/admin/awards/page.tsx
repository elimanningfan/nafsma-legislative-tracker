import prisma from '@/lib/prisma'
import { AwardsClient } from './awards-client'

export default async function AwardsPage() {
  const awards = await prisma.award.findMany({
    orderBy: [{ year: 'desc' }, { category: 'asc' }],
    include: { createdBy: { select: { name: true } } },
  })

  return <AwardsClient initialAwards={awards} />
}
