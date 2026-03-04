import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ResourcesClient } from './resources-client';
import { LoginPrompt } from '@/components/member/login-prompt';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Resources',
  description:
    'Access NAFSMA member-only resources including newsletters, webinar recordings, committee documents, and guides.',
};

export default async function ResourcesPage() {
  const session = await auth();

  // Check authentication and membership
  if (!session) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh]">
          <section className="bg-nafsma-blue text-white py-12">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-h2-mobile md:text-h2 text-white">
                Member Resources
              </h1>
            </div>
          </section>
          <LoginPrompt variant="not-logged-in" />
        </main>
        <Footer />
      </>
    );
  }

  const user = session.user as {
    role?: string;
    membershipStatus?: string | null;
  };

  // Check expired membership
  if (user.role === 'MEMBER' && user.membershipStatus === 'EXPIRED') {
    return (
      <>
        <Header />
        <main className="min-h-[60vh]">
          <section className="bg-nafsma-blue text-white py-12">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-h2-mobile md:text-h2 text-white">
                Member Resources
              </h1>
            </div>
          </section>
          <LoginPrompt variant="expired" />
        </main>
        <Footer />
      </>
    );
  }

  // Check pending membership
  if (
    user.role === 'MEMBER' &&
    user.membershipStatus !== 'ACTIVE'
  ) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh]">
          <section className="bg-nafsma-blue text-white py-12">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-h2-mobile md:text-h2 text-white">
                Member Resources
              </h1>
            </div>
          </section>
          <LoginPrompt variant="pending" />
        </main>
        <Footer />
      </>
    );
  }

  // Fetch resources
  const resources = await prisma.resource.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      fileSize: true,
      fileMimeType: true,
      category: true,
      publishedAt: true,
    },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-nafsma-light-blue">
        <section className="bg-nafsma-blue text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-h2-mobile md:text-h2 text-white mb-2">
              Member Resources
            </h1>
            <p className="text-blue-100">
              Newsletters, webinar recordings, committee documents, and more
            </p>
          </div>
        </section>
        <ResourcesClient resources={resources} />
      </main>
      <Footer />
    </>
  );
}
