import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { CalendarDays, ArrowRight, Lock, User } from "lucide-react";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and updates from NAFSMA on flood and stormwater management policy.",
};

async function getPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
      },
    });
    return posts;
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">News & Updates</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              Stay informed on federal flood and stormwater policy developments.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            {posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article key={post.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      {post.category && (
                        <span className="text-xs font-semibold px-2 py-1 bg-nafsma-light-blue text-nafsma-blue rounded-full">
                          {post.category.name}
                        </span>
                      )}
                      {post.membersOnly && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-nafsma-warm-gray/60">
                          <Lock className="h-3 w-3" /> Members Only
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl mb-2">
                      <Link
                        href={`/news/${post.slug}`}
                        className="text-nafsma-blue hover:text-nafsma-teal"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt && (
                      <p className="text-nafsma-warm-gray text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-nafsma-warm-gray/60">
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author.name}
                      </span>
                      {post.readingTime && (
                        <span>{post.readingTime} min read</span>
                      )}
                    </div>
                    <Link
                      href={`/news/${post.slug}`}
                      className="inline-flex items-center mt-4 text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
                    >
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-nafsma-warm-gray mb-4">
                  News articles will appear here once published.
                </p>
                <p className="text-sm text-nafsma-warm-gray/60">
                  Check back soon for updates on federal flood and stormwater policy.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
