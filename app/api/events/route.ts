import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })
  return NextResponse.json(events)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const event = await prisma.event.create({
    data: {
      title: data.title,
      slug,
      description: data.description || '',
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location || null,
      registrationUrl: data.registrationUrl || null,
      type: data.type || 'CONFERENCE',
      status: data.status || 'DRAFT',
      membersOnly: data.membersOnly || false,
      featuredImage: data.featuredImage || null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(event, { status: 201 })
}
