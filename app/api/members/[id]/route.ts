import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const application = await prisma.membershipApplication.findUnique({
    where: { id },
    include: { reviewedBy: { select: { name: true } } },
  })
  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(application)
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

  const application = await prisma.membershipApplication.update({
    where: { id },
    data: {
      notes: data.notes,
    },
  })

  return NextResponse.json(application)
}
