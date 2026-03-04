import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const award = await prisma.award.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true } } },
  })
  if (!award) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(award)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const data = await req.json()

  const award = await prisma.award.update({
    where: { id },
    data: {
      year: parseInt(data.year),
      category: data.category,
      winnerName: data.winnerName,
      agency: data.agency || null,
      city: data.city || null,
      state: data.state || null,
      description: data.description || null,
      photo: data.photo || null,
    },
  })

  return NextResponse.json(award)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.award.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
