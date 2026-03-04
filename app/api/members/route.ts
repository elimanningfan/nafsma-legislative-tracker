import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
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

  return NextResponse.json({ applications, members })
}
