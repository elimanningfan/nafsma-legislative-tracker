import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Trophy, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Awards",
  description: "NAFSMA Awards recognizing excellence in flood and stormwater management.",
};

const categories = [
  {
    title: "Innovative Flood/Stormwater Project Award",
    description:
      "Recognizes exceptional projects that demonstrate innovation in flood risk management, stormwater management, or related infrastructure. Projects must be completed and operational.",
    criteria: [
      "Innovation in design, construction, or management",
      "Demonstrated effectiveness in reducing flood risk or improving stormwater management",
      "Community benefit and public engagement",
      "Transferability and potential for replication",
    ],
  },
  {
    title: "Communications Award",
    description:
      "Honors outstanding public communications efforts that advance understanding of flood and stormwater management issues.",
    criteria: [
      "Creativity and effectiveness of messaging",
      "Reach and engagement with target audiences",
      "Advancement of public understanding",
      "Use of multiple communication channels",
    ],
  },
];

export default function AwardsPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4 text-center">
            <Trophy className="h-12 w-12 text-nafsma-teal mx-auto mb-4" />
            <h1 className="text-white">NAFSMA Awards</h1>
            <p className="text-blue-100 mt-4 max-w-2xl mx-auto">
              Recognizing excellence and innovation in flood and stormwater management.
            </p>
          </div>
        </section>

        {/* Award Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-8">Award Categories</h2>
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.title} className="bg-nafsma-light-blue rounded-lg p-8">
                  <h3 className="text-xl mb-3">{cat.title}</h3>
                  <p className="text-nafsma-warm-gray mb-4">{cat.description}</p>
                  <h4 className="text-sm font-semibold text-nafsma-blue mb-2">Judging Criteria</h4>
                  <ul className="space-y-1">
                    {cat.criteria.map((c) => (
                      <li key={c} className="text-sm text-nafsma-warm-gray flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-nafsma-teal rounded-full mt-2 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Year */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="mb-4">2026 Awards</h2>
            <p className="text-nafsma-warm-gray mb-8">
              Awards will be presented at the NAFSMA Annual Meeting in August 2026 in Washington, DC.
              Application details and deadlines will be announced in Spring 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/awards/apply"
                className="inline-flex items-center justify-center px-6 py-3 bg-nafsma-teal text-white font-semibold rounded-md hover:bg-nafsma-blue transition-colors"
              >
                Apply for an Award <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/awards/past-winners"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-nafsma-blue text-nafsma-blue font-semibold rounded-md hover:bg-nafsma-blue hover:text-white transition-colors"
              >
                Past Winners
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
