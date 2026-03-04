import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, Users, Shield, Landmark, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About NAFSMA",
  description: "Learn about the National Association of Flood & Stormwater Management Agencies, our mission, history, and federal partnerships.",
};

const focusAreas = [
  {
    icon: Shield,
    title: "Federal Advocacy",
    description: "Representing member interests before Congress, the Administration, and federal agencies on flood and stormwater policy.",
  },
  {
    icon: Landmark,
    title: "Policy Development",
    description: "Developing policy positions on WRDA, appropriations, NFIP, Clean Water Act, and other federal programs.",
  },
  {
    icon: Users,
    title: "Peer Network",
    description: "Facilitating connections between public agencies facing similar flood and stormwater management challenges.",
  },
  {
    icon: Globe,
    title: "Education & Outreach",
    description: "Providing resources, webinars, and the annual meeting to keep members informed and engaged.",
  },
];

const timeline = [
  { year: "1978", event: "NAFSMA founded to give flood control agencies a unified federal voice" },
  { year: "1986", event: "Advocated for Water Resources Development Act reforms" },
  { year: "1994", event: "Expanded focus to include stormwater management agencies" },
  { year: "2000", event: "Launched awards program recognizing innovative projects" },
  { year: "2012", event: "Helped secure post-Sandy flood mitigation funding" },
  { year: "2020", event: "Transitioned to virtual events and expanded webinar series" },
  { year: "2024", event: "Celebrated WRDA 2024 passage with key NAFSMA-backed provisions" },
  { year: "2026", event: "Continuing advocacy for WRDA 2026, NFIP reauthorization, and FY26 appropriations" },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">About NAFSMA</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              The national voice for public agencies managing flood risk and stormwater infrastructure.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-6">Our Mission</h2>
            <p className="text-nafsma-warm-gray text-lg leading-relaxed mb-6">
              The National Association of Flood and Stormwater Management Agencies (NAFSMA) is a nonprofit
              organization that represents the interests of public agencies responsible for flood control
              and stormwater management at the federal level. Founded in 1978, NAFSMA serves as the primary
              liaison between its member agencies and federal entities including the U.S. Army Corps of
              Engineers (USACE), Federal Emergency Management Agency (FEMA), and the Environmental
              Protection Agency (EPA).
            </p>
            <p className="text-nafsma-warm-gray leading-relaxed">
              Our member agencies collectively protect millions of Americans from flooding, manage billions
              of dollars in infrastructure, and navigate an increasingly complex federal regulatory landscape.
              NAFSMA ensures their voices are heard in Washington.
            </p>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-12">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {focusAreas.map((area) => {
                const Icon = area.icon;
                return (
                  <div key={area.title} className="bg-white rounded-lg p-6 shadow-sm">
                    <Icon className="h-10 w-10 text-nafsma-teal mb-4" />
                    <h3 className="text-lg mb-2">{area.title}</h3>
                    <p className="text-sm text-nafsma-warm-gray">{area.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Federal Partnerships */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-8">Federal Partnerships</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-nafsma-teal pl-6">
                <h3 className="text-lg mb-2">U.S. Army Corps of Engineers (USACE)</h3>
                <p className="text-sm text-nafsma-warm-gray">
                  NAFSMA works with USACE on flood risk management studies, project authorizations through
                  WRDA, and civil works funding priorities. Many NAFSMA members are local sponsors of
                  USACE flood control projects.
                </p>
              </div>
              <div className="border-l-4 border-nafsma-teal pl-6">
                <h3 className="text-lg mb-2">Federal Emergency Management Agency (FEMA)</h3>
                <p className="text-sm text-nafsma-warm-gray">
                  We engage FEMA on NFIP policy, flood mapping modernization, Hazard Mitigation Grant
                  Program funding, and Community Rating System improvements.
                </p>
              </div>
              <div className="border-l-4 border-nafsma-teal pl-6">
                <h3 className="text-lg mb-2">Environmental Protection Agency (EPA)</h3>
                <p className="text-sm text-nafsma-warm-gray">
                  NAFSMA advocates for practical, effective stormwater regulations under the Clean Water
                  Act and works with EPA on green infrastructure and water quality programs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* History Timeline */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-center mb-12">Our History</h2>
            <div className="space-y-6">
              {timeline.map((item) => (
                <div key={item.year} className="flex gap-6">
                  <div className="flex-shrink-0 w-20 text-right">
                    <span className="text-nafsma-teal font-bold text-lg">{item.year}</span>
                  </div>
                  <div className="flex-shrink-0 w-px bg-nafsma-teal relative">
                    <div className="absolute top-1 -left-1.5 w-3 h-3 rounded-full bg-nafsma-teal" />
                  </div>
                  <div className="pb-6">
                    <p className="text-nafsma-warm-gray">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-nafsma-blue">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-white mb-4">Join Our Community</h2>
            <p className="text-blue-100 mb-8 max-w-lg mx-auto">
              Connect with 200+ agencies shaping federal flood and stormwater policy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/membership/join"
                className="inline-flex items-center justify-center px-8 py-3 bg-nafsma-teal text-white font-semibold rounded-md hover:bg-white hover:text-nafsma-blue transition-colors"
              >
                Become a Member <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
