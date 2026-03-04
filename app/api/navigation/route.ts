import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const items = await prisma.navigationItem.findMany({
      orderBy: [{ menuGroup: 'asc' }, { displayOrder: 'asc' }],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return NextResponse.json({ error: 'Failed to fetch navigation' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { label, href, parentId, menuGroup, displayOrder, isExternal } = body;

    if (!label || !href) {
      return NextResponse.json({ error: 'Label and href are required' }, { status: 400 });
    }

    const item = await prisma.navigationItem.create({
      data: {
        label,
        href,
        parentId: parentId || null,
        menuGroup: menuGroup || 'main',
        displayOrder: displayOrder || 0,
        isExternal: isExternal || false,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating nav item:', error);
    return NextResponse.json({ error: 'Failed to create navigation item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    // Batch update all items' display orders
    for (const item of items) {
      await prisma.navigationItem.update({
        where: { id: item.id },
        data: {
          displayOrder: item.displayOrder,
          parentId: item.parentId || null,
          label: item.label,
          href: item.href,
          isExternal: item.isExternal,
          menuGroup: item.menuGroup,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating navigation:', error);
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 });
  }
}
