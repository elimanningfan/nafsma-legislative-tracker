export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PagesListClient } from './pages-list-client';

export default async function PagesManagementPage() {
  const pages = await prisma.page.findMany({
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const serializedPages = pages.map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: page.status,
    template: page.template,
    author: page.author.name,
    updatedAt: page.updatedAt.toISOString(),
    publishedAt: page.publishedAt?.toISOString() || null,
    version: page.version,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500 mt-1">
            Create and manage your website pages ({serializedPages.length} total)
          </p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Page
          </Button>
        </Link>
      </div>

      <PagesListClient pages={serializedPages} />
    </div>
  );
}
