export const dynamic = 'force-dynamic';

import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Droplets,
  Landmark,
  MapPin,
  Shield,
  Brain,
  Users,
  Megaphone,
  CalendarDays,
  ArrowRight,
  Trophy,
  Mail,
} from "lucide-react";

async function getHomePageData() {
  const [events, stats, awards] = await Promise.all([
    prisma.event
      .findMany({
        where: { status: "PUBLISHED", date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 3,
      })
      .catch(() => []),
    prisma.editableContent
      .findMany({
        where: { pageSlug: "home", section: "stats" },
        orderBy: { order: "asc" },
      })
      .catch(() => []),
    prisma.award
      .findMany({
        orderBy: { year: "desc" },
        take: 1,
      })
      .catch(() => []),
  ]);

  return { events, stats, awards };
}

const defaultStats = [
  { label: "Years of Leadership", content: "46+" },
  { label: "Member Agencies", content: "200+" },
  { label: "Federal Partners", content: "3" },
  { label: "Annual Meeting", content: "Since 1978" },
];

const whoWeServe = [
  { icon: Building2, title: "Flood Districts", description: "Regional flood control and water management districts" },
  { icon: Droplets, title: "Stormwater Utilities", description: "Municipal stormwater management programs" },
  { icon: Landmark, title: "State Agencies", description: "State-level water resource and environmental agencies" },
  { icon: MapPin, title: "Municipalities", description: "Cities and counties managing local flood and stormwater systems" },
];

const whyNafsma = [
  { icon: Shield, title: "Federal Access", description: "Direct engagement with Congress, USACE, FEMA, and EPA on policies that impact your agency." },
  { icon: Brain, title: "Policy Intelligence", description: "Timely updates on federal legislation, regulations, and funding opportunities." },
  { icon: Users, title: "Community", description: "A national network of peers facing similar challenges in flood and stormwater management." },
  { icon: Megaphone, title: "Advocacy", description: "A unified voice advocating for practical, effective federal water policy." },
];

const priorities = [
  {
    title: "WRDA 2026",
    description: "Advocating for robust Water Resources Development Act provisions that support local flood management infrastructure.",
    href: "/policy/wrda-2026",
  },
  {
    title: "FY26 Appropriations",
    description: "Securing federal funding for USACE civil works, FEMA flood mitigation, and EPA stormwater programs.",
    href: "/policy/fy26-appropriations",
  },
  {
    title: "NFIP Reauthorization",
    description: "Pushing for a long-term reauthorization of the National Flood Insurance Program with meaningful reforms.",
    href: "/policy/nfip-reauthorization",
  },
];

export default async function HomePage() {
  const { events, stats, awards } = await getHomePageData();

  const displayStats =
    stats.length > 0
      ? stats.map((s) => ({ label: s.label, content: s.content }))
      : defaultStats;

  const latestAward = awards[0] ?? null;

  return (
    <>
      <Header />
      <main>
        {/* 1. Hero Section */}
        <section className="relative min-h-[540px] flex items-center justify-center bg-nafsma-dark-navy">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/hero-infrastructure.jpg')",
              opacity: 0.35,
            }}
          />
          <div className="relative z-10 container mx-auto px-4 py-20 text-center">
            <h1 className="text-white text-h1-mobile md:text-h1 max-w-4xl mx-auto leading-tight">
              Driving Flood and Stormwater Policy That Benefits Our Communities
            </h1>
            <p className="mt-6 text-gray-200 text-lg max-w-2xl mx-auto">
              The national voice for public agencies managing flood risk and stormwater infrastructure since 1978.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/membership/join"
                className="inline-flex items-center justify-center px-8 py-3 bg-nafsma-teal text-white font-semibold rounded-md hover:bg-nafsma-blue transition-colors"
              >
                Become a Member
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
              >
                Learn About NAFSMA
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Federal Partner Logos Strip */}
        <section className="bg-white py-8 border-b">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-nafsma-warm-gray/60 uppercase tracking-wider mb-6 font-medium">
              Federal Partners
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-nafsma-light-blue rounded-lg flex items-center justify-center">
                  <span className="text-nafsma-blue font-bold text-sm">USACE</span>
                </div>
                <span className="text-xs text-nafsma-warm-gray">U.S. Army Corps of Engineers</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-nafsma-light-blue rounded-lg flex items-center justify-center">
                  <span className="text-nafsma-blue font-bold text-sm">FEMA</span>
                </div>
                <span className="text-xs text-nafsma-warm-gray">Federal Emergency Mgmt. Agency</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 bg-nafsma-light-blue rounded-lg flex items-center justify-center">
                  <span className="text-nafsma-blue font-bold text-sm">EPA</span>
                </div>
                <span className="text-xs text-nafsma-warm-gray">Environmental Protection Agency</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Who We Serve */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-4">Who We Serve</h2>
            <p className="text-center text-nafsma-warm-gray max-w-2xl mx-auto mb-12">
              NAFSMA represents the diverse public agencies responsible for protecting communities from flooding and managing stormwater.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {whoWeServe.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-nafsma-light-blue rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-nafsma-teal" />
                    </div>
                    <h3 className="text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-nafsma-warm-gray">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Why NAFSMA */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-4">Why NAFSMA</h2>
            <p className="text-center text-nafsma-warm-gray max-w-2xl mx-auto mb-12">
              Your membership connects you to the federal policy process and a national community of peers.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyNafsma.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <Icon className="h-10 w-10 text-nafsma-teal mb-4" />
                    <h3 className="text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-nafsma-warm-gray">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Stats Bar */}
        <section className="py-12 bg-nafsma-teal">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {displayStats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {stat.content}
                  </div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Current Priorities */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-4">Current Priorities</h2>
            <p className="text-center text-nafsma-warm-gray max-w-2xl mx-auto mb-12">
              Our advocacy focuses on the most impactful federal policy areas for flood and stormwater agencies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {priorities.map((item) => (
                <div key={item.title} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-nafsma-warm-gray mb-4">{item.description}</p>
                  <Link
                    href={item.href}
                    className="inline-flex items-center text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/policy"
                className="inline-flex items-center px-6 py-3 bg-nafsma-blue text-white font-semibold rounded-md hover:bg-nafsma-dark-navy transition-colors"
              >
                View All Policy Priorities
              </Link>
            </div>
          </div>
        </section>

        {/* 7. Upcoming Events */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-4">Upcoming Events</h2>
            <p className="text-center text-nafsma-warm-gray max-w-2xl mx-auto mb-12">
              Connect with peers and policymakers at NAFSMA events.
            </p>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-2 bg-nafsma-teal" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-nafsma-teal mb-3">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-lg mb-2">{event.title}</h3>
                      {event.location && (
                        <p className="text-sm text-nafsma-warm-gray/70 mb-3">{event.location}</p>
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
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Annual Meeting 2026", date: "August 2026", location: "Washington, DC" },
                  { title: "Spring Policy Webinar", date: "April 2026", location: "Virtual" },
                  { title: "Mentoring Program Kickoff", date: "May 2026", location: "Virtual" },
                ].map((placeholder) => (
                  <div key={placeholder.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="h-2 bg-nafsma-teal" />
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-nafsma-teal mb-3">
                        <CalendarDays className="h-4 w-4" />
                        <span>{placeholder.date}</span>
                      </div>
                      <h3 className="text-lg mb-2">{placeholder.title}</h3>
                      <p className="text-sm text-nafsma-warm-gray/70 mb-3">{placeholder.location}</p>
                      <Link
                        href="/events"
                        className="inline-flex items-center text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
                      >
                        Event Details <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center mt-8">
              <Link
                href="/events"
                className="inline-flex items-center px-6 py-3 bg-nafsma-blue text-white font-semibold rounded-md hover:bg-nafsma-dark-navy transition-colors"
              >
                View All Events
              </Link>
            </div>
          </div>
        </section>

        {/* 8. Member Spotlight / Award */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-8">
              <Trophy className="h-10 w-10 text-nafsma-teal mx-auto mb-4" />
              <h2>Member Spotlight</h2>
            </div>
            {latestAward ? (
              <div className="bg-nafsma-light-blue rounded-lg p-8 text-center">
                <p className="text-sm text-nafsma-teal font-semibold uppercase tracking-wider mb-2">
                  {latestAward.year} {latestAward.category.replace(/_/g, " ")} Award
                </p>
                <h3 className="text-2xl mb-2">{latestAward.winnerName}</h3>
                {latestAward.agency && (
                  <p className="text-nafsma-warm-gray mb-4">
                    {latestAward.agency}
                    {latestAward.city && latestAward.state && ` - ${latestAward.city}, ${latestAward.state}`}
                  </p>
                )}
                {latestAward.description && (
                  <p className="text-sm text-nafsma-warm-gray max-w-2xl mx-auto">
                    {latestAward.description.slice(0, 200)}
                  </p>
                )}
                <Link
                  href="/awards"
                  className="inline-flex items-center mt-6 text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
                >
                  See All Awards <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="bg-nafsma-light-blue rounded-lg p-8 text-center">
                <p className="text-sm text-nafsma-teal font-semibold uppercase tracking-wider mb-2">
                  Award Recognition
                </p>
                <h3 className="text-2xl mb-2">NAFSMA Awards Program</h3>
                <p className="text-nafsma-warm-gray mb-4">
                  Recognizing excellence in flood and stormwater management since 1978.
                </p>
                <Link
                  href="/awards"
                  className="inline-flex items-center mt-2 text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
                >
                  Learn About Our Awards <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 9. Newsletter Signup */}
        <section className="py-16 bg-nafsma-dark-navy">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Mail className="h-10 w-10 text-nafsma-teal mx-auto mb-4" />
            <h2 className="text-white mb-4">Stay Informed</h2>
            <p className="text-gray-300 mb-8">
              Subscribe to NAFSMA updates on federal policy, events, and resources for flood and stormwater management agencies.
            </p>
            {/* Mailchimp embed placeholder */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-md text-sm bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-nafsma-teal"
                disabled
              />
              <button
                className="px-6 py-3 bg-nafsma-teal text-white font-semibold rounded-md hover:bg-nafsma-blue transition-colors text-sm"
                disabled
              >
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Newsletter integration coming soon. Contact info@nafsma.org to subscribe.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
