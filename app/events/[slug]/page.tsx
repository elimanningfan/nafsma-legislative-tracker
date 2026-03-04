export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { CalendarDays, MapPin, ArrowLeft, ExternalLink, Lock } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getEvent(slug: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug },
    });
    return event;
  } catch {
    return null;
  }
}

// Fallback for annual meeting
function getAnnualMeetingFallback() {
  return {
    title: "NAFSMA Annual Meeting 2026",
    slug: "annual-meeting-2026",
    date: new Date("2026-08-18"),
    endDate: new Date("2026-08-20"),
    location: "Washington, DC",
    type: "CONFERENCE",
    status: "PUBLISHED",
    membersOnly: false,
    registrationUrl: null,
    featuredImage: null,
    description: `
<h2>Join NAFSMA in Washington, DC</h2>
<p>The NAFSMA Annual Meeting brings together flood and stormwater management professionals from across the country for three days of policy education, networking, and advocacy.</p>

<h3>What to Expect</h3>
<ul>
<li>Policy briefings on WRDA, NFIP, appropriations, and regulatory issues</li>
<li>Presentations from USACE, FEMA, and EPA leadership</li>
<li>Congressional visits with your representatives and senators</li>
<li>Networking with peers from 200+ member agencies</li>
<li>NAFSMA Awards ceremony recognizing innovative projects and communications</li>
</ul>

<h3>Schedule Overview</h3>
<p><strong>Day 1 (August 18):</strong> Registration, welcome reception, and opening session</p>
<p><strong>Day 2 (August 19):</strong> Policy sessions, federal agency panels, and awards dinner</p>
<p><strong>Day 3 (August 20):</strong> Capitol Hill visits and wrap-up</p>

<h3>Registration</h3>
<p>Registration details and rates will be announced in Spring 2026. NAFSMA members receive discounted registration.</p>
    `,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  const title = event?.title || (slug === "annual-meeting-2026" ? "Annual Meeting 2026" : "Event");
  return {
    title,
    description: event?.description?.replace(/<[^>]*>/g, "").slice(0, 160) || "NAFSMA Event",
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let event = await getEvent(slug);

  if (!event && slug === "annual-meeting-2026") {
    event = getAnnualMeetingFallback() as unknown as typeof event;
  }

  if (!event) {
    notFound();
  }

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/events"
              className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> All Events
            </Link>
            <h1 className="text-white">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-blue-100">
                <CalendarDays className="h-5 w-5" />
                <span>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {event.endDate && (
                    <>
                      {" - "}
                      {new Date(event.endDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </>
                  )}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-blue-100">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              )}
              {event.membersOnly && (
                <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-200">
                  <Lock className="h-4 w-4" /> Members Only
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />

            {event.registrationUrl && (
              <div className="mt-8 p-6 bg-nafsma-light-blue rounded-lg text-center">
                <h3 className="mb-4">Ready to Attend?</h3>
                <a
                  href={event.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-3 bg-nafsma-teal text-white font-semibold rounded-md hover:bg-nafsma-blue transition-colors"
                >
                  Register Now <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            )}

            <div className="mt-12 pt-8 border-t">
              <Link
                href="/events"
                className="inline-flex items-center text-nafsma-teal hover:text-nafsma-blue font-semibold"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> All Events
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
