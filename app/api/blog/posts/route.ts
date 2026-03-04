import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, status, categoryId, tags, seoTitle, seoDescription, featuredImage, membersOnly } = body;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const readingTime = calculateReadingTime(content);

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, ''),
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        featured: false,
        membersOnly: membersOnly || false,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        featuredImage: featuredImage || null,
        readingTime,
        authorId: (session.user as any).id,
        categoryId: categoryId || null,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await prisma.blogPostTag.create({
          data: { postId: blogPost.id, tagId },
        });
      }
    }

    return NextResponse.json({ success: true, post: blogPost });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
