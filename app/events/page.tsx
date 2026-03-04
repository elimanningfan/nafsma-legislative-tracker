export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { CalendarDays, MapPin, ArrowRight, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Events",
  description: "NAFSMA conferences, webinars, and mentoring events for flood and stormwater management professionals.",
};

async function getEvents() {
  try {
    const now = new Date();
    const [upcoming, past] = await Promise.all([
      prisma.event.findMany({
        where: { status: "PUBLISHED", date: { gte: now } },
        orderBy: { date: "asc" },
      }),
      prisma.event.findMany({
        where: { status: "PUBLISHED", date: { lt: now } },
        orderBy: { date: "desc" },
        take: 6,
      }),
    ]);
    return { upcoming, past };
  } catch {
    return { upcoming: [], past: [] };
  }
}

const placeholderEvents = [
  {
    id: "1",
    title: "NAFSMA Annual Meeting 2026",
    slug: "annual-meeting-2026",
    date: new Date("2026-08-18"),
    endDate: new Date("2026-08-20"),
    location: "Washington, DC",
    description: "Join NAFSMA members for three days of policy sessions, networking, and advocacy on Capitol Hill.",
    type: "CONFERENCE" as const,
    membersOnly: false,
  },
  {
    id: "2",
    title: "Spring Policy Webinar",
    slug: "spring-policy-webinar-2026",
    date: new Date("2026-04-15"),
    endDate: null,
    location: "Virtual",
    description: "Update on WRDA 2026, FY26 appropriations, and NFIP reauthorization developments.",
    type: "WEBINAR" as const,
    membersOnly: true,
  },
  {
    id: "3",
    title: "Mentoring Program Session",
    slug: "mentoring-session-spring-2026",
    date: new Date("2026-05-10"),
    endDate: null,
    location: "Virtual",
    description: "Quarterly mentoring program session connecting emerging leaders with experienced professionals.",
    type: "MENTORING" as const,
    membersOnly: true,
  },
];

type EventCardProps = {
  id: string;
  title: string;
  slug: string;
  date: Date;
  endDate?: Date | null;
  location?: string | null;
  description: string;
  type: string;
  membersOnly: boolean;
};

function EventCard({ event }: { event: EventCardProps }) {
  const typeLabels: Record<string, string> = {
    CONFERENCE: "Conference",
    WEBINAR: "Webinar",
    MENTORING: "Mentoring",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border">
      <div className="h-2 bg-nafsma-teal" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold px-2 py-1 bg-nafsma-light-blue text-nafsma-blue rounded-full">
            {typeLabels[event.type] || event.type}
          </span>
          {event.membersOnly && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-nafsma-warm-gray/60">
              <Lock className="h-3 w-3" /> Members Only
            </span>
          )}
        </div>
        <h3 className="text-lg mb-2">{event.title}</h3>
        <div className="flex items-center gap-2 text-sm text-nafsma-teal mb-2">
          <CalendarDays className="h-4 w-4" />
          <span>
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {event.endDate && (
              <>
                {" - "}
                {new Date(event.endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            )}
          </span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-nafsma-warm-gray/70 mb-3">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        )}
        <p className="text-sm text-nafsma-warm-gray line-clamp-2 mb-4">
          {event.description.replace(/<[^>]*>/g, "").slice(0, 150)}
        </p>
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
        >
          Event Details <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();
  const displayUpcoming = upcoming.length > 0 ? upcoming : placeholderEvents;

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Events</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              Conferences, webinars, and networking opportunities for flood and stormwater professionals.
            </p>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayUpcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* Past Events */}
        {past.length > 0 && (
          <section className="py-16 bg-nafsma-light-blue">
            <div className="container mx-auto px-4">
              <h2 className="mb-8">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Annual Meeting CTA */}
        <section className="py-12 bg-nafsma-teal">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-white mb-4">NAFSMA Annual Meeting 2026</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Join us in Washington, DC for policy sessions, Congressional visits, and networking with your peers.
            </p>
            <Link
              href="/events/annual-meeting-2026"
              className="inline-flex items-center px-8 py-3 bg-white text-nafsma-teal font-semibold rounded-md hover:bg-nafsma-light-blue transition-colors"
            >
              Annual Meeting Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
