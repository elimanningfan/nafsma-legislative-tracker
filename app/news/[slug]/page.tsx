export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { tiptapToHtml } from "@/lib/tiptap-renderer";
import { CalendarDays, ArrowLeft, User, Clock, Lock, Tag } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: true } },
      },
    });
    return post;
  } catch {
    return null;
  }
}

async function getRelatedPosts(categoryId: string | null, currentId: string) {
  if (!categoryId) return [];
  try {
    return await prisma.blogPost.findMany({
      where: {
        categoryId,
        id: { not: currentId },
        status: 'PUBLISHED',
      },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        category: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post?.seoTitle || post?.title || "News",
    description: post?.seoDescription || post?.excerpt || "NAFSMA News & Updates",
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.categoryId, post.id);
  const contentHtml = tiptapToHtml(post.content);
  const isMembersOnly = post.membersOnly;

  return (
    <>
      <Header />
      <main>
        {/* Article Header */}
        <article>
          <header className="bg-gradient-to-b from-nafsma-blue to-nafsma-dark-navy py-16 lg:py-20">
            <div className="container mx-auto px-4 max-w-3xl">
              <Link
                href="/news"
                className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-6 transition-colors"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to News
              </Link>

              {post.category && (
                <span className="inline-block px-3 py-1 bg-white/15 text-blue-100 rounded-full text-xs font-medium tracking-wide uppercase mb-4">
                  {post.category.name}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-4 text-blue-100 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-blue-200 text-sm">
                {post.publishedAt && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.name}
                </span>
                {post.readingTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {post.readingTime} min read
                  </span>
                )}
                {isMembersOnly && (
                  <span className="flex items-center gap-1.5 text-yellow-300">
                    <Lock className="h-4 w-4" /> Members Only
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="bg-white py-12 lg:py-16">
            <div className="container mx-auto px-4 max-w-3xl">
              {isMembersOnly ? (
                <div>
                  <div className="bg-nafsma-light-blue rounded-xl p-8 sm:p-10 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-nafsma-blue/10 rounded-full mb-5">
                      <Lock className="h-7 w-7 text-nafsma-blue" />
                    </div>
                    <h3 className="text-xl font-semibold text-nafsma-blue mb-3">
                      Members Only Content
                    </h3>
                    <p className="text-nafsma-warm-gray mb-6 max-w-md mx-auto">
                      This article is available exclusively to NAFSMA members.
                      Log in or join NAFSMA to access the full content.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-6 py-3 bg-nafsma-blue text-white font-semibold rounded-md hover:bg-nafsma-dark-navy transition-colors"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/membership/join"
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-nafsma-blue text-nafsma-blue font-semibold rounded-md hover:bg-nafsma-blue hover:text-white transition-colors"
                      >
                        Join NAFSMA
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="prose prose-lg prose-slate max-w-none
                    prose-headings:text-nafsma-blue prose-headings:font-semibold
                    prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-nafsma-warm-gray prose-p:leading-relaxed prose-p:mb-5
                    prose-a:text-nafsma-teal prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                    prose-ul:my-5 prose-li:text-nafsma-warm-gray prose-li:leading-relaxed
                    prose-blockquote:border-nafsma-teal prose-blockquote:text-gray-600 prose-blockquote:italic
                    prose-img:rounded-lg prose-img:shadow-md"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-nafsma-blue" />
                    {post.tags.map(({ tag }) => (
                      <span
                        key={tag.id}
                        className="text-xs font-medium px-3 py-1.5 bg-nafsma-light-blue text-nafsma-blue rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-gray-50 py-12 lg:py-16 border-t">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-xl font-semibold text-nafsma-blue mb-6">
                Related Articles
              </h2>
              <div className="grid gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/news/${related.slug}`}
                    className="block bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-nafsma-blue">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-sm text-nafsma-warm-gray line-clamp-2">
                            {related.excerpt}
                          </p>
                        )}
                      </div>
                      {related.publishedAt && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(related.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to News CTA */}
        <section className="bg-white py-8 border-t">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link
              href="/news"
              className="inline-flex items-center text-nafsma-teal hover:text-nafsma-blue font-semibold transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" /> All News & Updates
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
