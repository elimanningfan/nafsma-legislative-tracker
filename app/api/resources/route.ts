import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: 'desc' },
    include: { createdBy: { select: { name: true } } },
  })
  return NextResponse.json(resources)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  const resource = await prisma.resource.create({
    data: {
      title: data.title,
      description: data.description || null,
      fileUrl: data.fileUrl || null,
      fileSize: data.fileSize ? parseInt(data.fileSize) : null,
      fileMimeType: data.fileMimeType || null,
      category: data.category || 'GUIDE',
      membersOnly: data.membersOnly ?? true,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      createdById: session.user.id,
    },
  })

  return NextResponse.json(resource, { status: 201 })
}
