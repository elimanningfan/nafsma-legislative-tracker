import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const awards = await prisma.award.findMany({
    orderBy: [{ year: 'desc' }, { category: 'asc' }],
    include: { createdBy: { select: { name: true } } },
  })
  return NextResponse.json(awards)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  const award = await prisma.award.create({
    data: {
      year: parseInt(data.year),
      category: data.category,
      winnerName: data.winnerName,
      agency: data.agency || null,
      city: data.city || null,
      state: data.state || null,
      description: data.description || null,
      photo: data.photo || null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(award, { status: 201 })
}
