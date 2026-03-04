import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPostsClient } from './blog-posts-client';

export default async function BlogManagementPage() {
  const dbPosts = await prisma.blogPost.findMany({
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  const blogPosts = dbPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    status: post.status,
    membersOnly: post.membersOnly,
    author: post.author.name,
    category: post.category ? { id: post.category.id, name: post.category.name } : null,
    tags: post.tags.map((t) => ({ id: t.tag.id, name: t.tag.name })),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() || null,
    readingTime: post.readingTime || 5,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-500 mt-1">
            Manage news and blog posts ({blogPosts.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories">
            <Button variant="outline">Categories</Button>
          </Link>
          <Link href="/admin/blog/tags">
            <Button variant="outline">Tags</Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>
      </div>

      <BlogPostsClient
        blogPosts={blogPosts}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
