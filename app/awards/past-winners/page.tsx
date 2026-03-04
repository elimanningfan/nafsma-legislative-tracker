export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { Trophy, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Past Award Winners",
  description: "Archive of NAFSMA Award winners recognizing innovation in flood and stormwater management.",
};

async function getAwards() {
  try {
    const awards = await prisma.award.findMany({
      orderBy: [{ year: "desc" }, { category: "asc" }],
    });
    return awards;
  } catch {
    return [];
  }
}

const categoryLabels: Record<string, string> = {
  INNOVATIVE_PROJECT: "Innovative Project Award",
  COMMUNICATIONS: "Communications Award",
};

export default async function PastWinnersPage() {
  const awards = await getAwards();

  // Group by year
  const byYear = awards.reduce<Record<number, typeof awards>>((acc, award) => {
    if (!acc[award.year]) acc[award.year] = [];
    acc[award.year].push(award);
    return acc;
  }, {});

  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/awards"
                className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Awards
              </Link>
              <h1 className="text-white">Past Award Winners</h1>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            {years.length > 0 ? (
              <div className="space-y-12">
                {years.map((year) => (
                  <div key={year}>
                    <h2 className="text-2xl mb-6 pb-2 border-b-2 border-nafsma-teal">{year}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {byYear[year].map((award) => (
                        <div key={award.id} className="bg-nafsma-light-blue rounded-lg p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Trophy className="h-5 w-5 text-nafsma-teal" />
                            <span className="text-xs font-semibold text-nafsma-teal uppercase tracking-wider">
                              {categoryLabels[award.category] || award.category}
                            </span>
                          </div>
                          <h3 className="text-lg mb-1">{award.winnerName}</h3>
                          {award.agency && (
                            <p className="text-sm text-nafsma-warm-gray">{award.agency}</p>
                          )}
                          {award.city && award.state && (
                            <p className="text-xs text-nafsma-warm-gray/70 mt-1">
                              {award.city}, {award.state}
                            </p>
                          )}
                          {award.description && (
                            <p className="text-sm text-nafsma-warm-gray mt-3">
                              {award.description.slice(0, 200)}
                              {award.description.length > 200 && "..."}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-nafsma-teal/30 mx-auto mb-4" />
                <p className="text-nafsma-warm-gray">
                  Past award winners will be displayed here once data is available.
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
