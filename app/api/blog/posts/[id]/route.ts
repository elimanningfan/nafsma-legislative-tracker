import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, excerpt, status, categoryId, tags, seoTitle, seoDescription, featuredImage, membersOnly } = body;

    const text = content.replace(/<[^>]*>/g, '');
    const readingTime = Math.ceil(text.trim().split(/\s+/).length / 200);

    const existing = await prisma.blogPost.findUnique({ where: { id }, select: { publishedAt: true } });

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200).replace(/<[^>]*>/g, ''),
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        membersOnly: membersOnly || false,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        featuredImage: featuredImage || null,
        readingTime,
        categoryId: categoryId || null,
        publishedAt: status === 'PUBLISHED' && !existing?.publishedAt ? new Date() : existing?.publishedAt,
      },
    });

    await prisma.blogPostTag.deleteMany({ where: { postId: id } });

    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await prisma.blogPostTag.create({
          data: { postId: id, tagId },
        });
      }
    }

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 400 });
    }
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id }, select: { id: true, title: true } });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Post "${post.title}" deleted` });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
