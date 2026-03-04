import prisma from '@/lib/prisma'
import { ResourcesClient } from './resources-client'

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })

  return <ResourcesClient initialResources={resources} />
}
