export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { tiptapToHtml } from "@/lib/tiptap-renderer";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Reserve known routes so they don't get caught by this dynamic route
const reservedSlugs = [
  "about",
  "policy",
  "events",
  "awards",
  "news",
  "contact",
  "faq",
  "privacy",
  "admin",
  "api",
  "login",
  "membership",
  "resources",
];

async function getPage(slug: string) {
  if (reservedSlugs.includes(slug)) return null;
  try {
    const page = await prisma.page.findUnique({
      where: { slug, status: "PUBLISHED" },
      include: { author: { select: { name: true } } },
    });
    return page;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  return {
    title: page?.seoTitle || page?.title || "Page Not Found",
    description: page?.seoDescription || page?.excerpt || "",
  };
}

export default async function DynamicCMSPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">{page.title}</h1>
            {page.excerpt && (
              <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
                {page.excerpt}
              </p>
            )}
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div
              className="prose prose-lg prose-slate max-w-none
                prose-headings:text-nafsma-blue prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-nafsma-warm-gray prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-nafsma-teal prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-ul:my-5 prose-li:text-nafsma-warm-gray
                prose-blockquote:border-nafsma-teal"
              dangerouslySetInnerHTML={{ __html: tiptapToHtml(page.content) }}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
