export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { CalendarDays, ArrowLeft, User, Lock } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        tags: { include: { tag: true } },
      },
    });
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return {
    title: post?.seoTitle || post?.title || "News",
    description: post?.seoDescription || post?.excerpt || "NAFSMA News",
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // If members-only, show teaser
  const isMembersOnly = post.membersOnly;

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/news"
              className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> News & Updates
            </Link>
            <h1 className="text-white">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-blue-100 text-sm">
              {post.publishedAt && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author.name}
              </span>
              {post.category && (
                <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs">
                  {post.category.name}
                </span>
              )}
              {post.readingTime && <span>{post.readingTime} min read</span>}
              {isMembersOnly && (
                <span className="flex items-center gap-1 text-yellow-200">
                  <Lock className="h-4 w-4" /> Members Only
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            {isMembersOnly ? (
              <div>
                {post.excerpt && (
                  <p className="text-nafsma-warm-gray text-lg mb-8 italic">{post.excerpt}</p>
                )}
                <div className="bg-nafsma-light-blue rounded-lg p-8 text-center">
                  <Lock className="h-8 w-8 text-nafsma-blue mx-auto mb-4" />
                  <h3 className="text-xl mb-2">Members Only Content</h3>
                  <p className="text-nafsma-warm-gray mb-6">
                    This article is available exclusively to NAFSMA members.
                    Log in or join NAFSMA to access the full content.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-nafsma-blue">Tags:</span>
                {post.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 bg-nafsma-light-blue text-nafsma-blue rounded-full"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <Link
                href="/news"
                className="inline-flex items-center text-nafsma-teal hover:text-nafsma-blue font-semibold"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> All News
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
