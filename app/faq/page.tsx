export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { FaqAccordion } from "@/components/public/faq-accordion";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about NAFSMA, membership, events, and federal flood and stormwater policy.",
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const categoryLabels: Record<string, string> = {
  GENERAL: "General",
  MEMBERSHIP: "Membership",
  FEDERAL_PROGRAMS: "Federal Programs",
  EVENTS: "Events",
  RESOURCES: "Resources",
  CONTACT: "Contact",
};

const defaultFaqs: FaqItem[] = [
  {
    id: "1",
    question: "What is NAFSMA?",
    answer: "NAFSMA is the National Association of Flood and Stormwater Management Agencies, a nonprofit that represents public agencies in federal flood and stormwater policy discussions since 1978.",
    category: "GENERAL",
  },
  {
    id: "2",
    question: "Who can join NAFSMA?",
    answer: "NAFSMA membership is open to public agencies responsible for flood control and stormwater management, including flood districts, stormwater utilities, state agencies, and municipalities. Associate memberships are available for related organizations.",
    category: "MEMBERSHIP",
  },
  {
    id: "3",
    question: "What are the benefits of membership?",
    answer: "Members receive federal policy updates, access to webinars and resources, networking with peer agencies, participation in the mentoring program, and a voice in NAFSMA's advocacy efforts before Congress and federal agencies.",
    category: "MEMBERSHIP",
  },
  {
    id: "4",
    question: "What is the NAFSMA Annual Meeting?",
    answer: "The Annual Meeting is NAFSMA's flagship event held each August in Washington, DC. It features policy briefings, federal agency panels, Congressional visits, and networking with peers from across the country.",
    category: "EVENTS",
  },
  {
    id: "5",
    question: "What federal agencies does NAFSMA work with?",
    answer: "NAFSMA's primary federal partners are the U.S. Army Corps of Engineers (USACE), Federal Emergency Management Agency (FEMA), and the Environmental Protection Agency (EPA). We engage these agencies on flood risk management, flood insurance, and stormwater regulations.",
    category: "FEDERAL_PROGRAMS",
  },
  {
    id: "6",
    question: "How do I contact NAFSMA?",
    answer: "You can reach NAFSMA at info@nafsma.org, by phone at (202) 289-8625, or through the contact form on our website. Our office is located in Washington, DC.",
    category: "CONTACT",
  },
];

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ category: "asc" }, { displayOrder: "asc" }],
    });
    return faqs;
  } catch {
    return [];
  }
}

export default async function FaqPage() {
  const dbFaqs = await getFaqs();
  const faqs = dbFaqs.length > 0 ? dbFaqs : defaultFaqs;

  // Group by category
  const grouped = faqs.reduce<Record<string, FaqItem[]>>((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Frequently Asked Questions</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              Common questions about NAFSMA, membership, and flood and stormwater management.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            {categories.map((cat) => (
              <div key={cat} className="mb-10">
                <h2 className="text-xl mb-4 pb-2 border-b-2 border-nafsma-teal">
                  {categoryLabels[cat] || cat}
                </h2>
                <FaqAccordion items={grouped[cat]} />
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 bg-nafsma-light-blue">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4">Still Have Questions?</h2>
            <p className="text-nafsma-warm-gray mb-6">
              We are happy to help. Reach out to our team.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-nafsma-teal text-white font-semibold rounded-md hover:bg-nafsma-blue transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
