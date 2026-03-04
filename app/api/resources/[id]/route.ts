import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { createdBy: { select: { name: true } } },
  })
  if (!resource) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(resource)
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

  const resource = await prisma.resource.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      fileUrl: data.fileUrl || null,
      fileSize: data.fileSize ? parseInt(data.fileSize) : null,
      fileMimeType: data.fileMimeType || null,
      category: data.category,
      membersOnly: data.membersOnly ?? true,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
  })

  return NextResponse.json(resource)
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
  await prisma.resource.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
