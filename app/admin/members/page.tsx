export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma'
import { MembersClient } from './members-client'

export default async function MembersPage() {
  const [applications, members] = await Promise.all([
    prisma.membershipApplication.findMany({
      orderBy: { submittedAt: 'desc' },
      include: { reviewedBy: { select: { name: true } } },
    }),
    prisma.organization.findMany({
      where: { membershipStatus: 'ACTIVE' },
      orderBy: { name: 'asc' },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, title: true },
        },
      },
    }),
  ])

  return <MembersClient initialApplications={applications} initialMembers={members} />
}
