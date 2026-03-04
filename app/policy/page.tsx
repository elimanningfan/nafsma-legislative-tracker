import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowRight, FileText, Scale, Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Policy & Advocacy",
  description: "NAFSMA's federal policy priorities and advocacy approach for flood and stormwater management agencies.",
};

const legislativePriorities = [
  {
    title: "WRDA 2026",
    slug: "wrda-2026",
    icon: Scale,
    description: "The Water Resources Development Act is the primary vehicle for authorizing USACE flood management projects and policies. NAFSMA advocates for provisions that streamline project delivery, improve cost-sharing, and address emerging challenges.",
    status: "Active",
  },
  {
    title: "FY26 Appropriations",
    slug: "fy26-appropriations",
    icon: FileText,
    description: "Federal funding for USACE civil works, FEMA flood mitigation grants, and EPA stormwater programs directly impacts our members. NAFSMA works to secure robust funding levels.",
    status: "Active",
  },
  {
    title: "NFIP Reauthorization",
    slug: "nfip-reauthorization",
    icon: Landmark,
    description: "The National Flood Insurance Program needs long-term reauthorization with reforms that serve communities. NAFSMA pushes for affordability, mapping accuracy, and mitigation incentives.",
    status: "Active",
  },
];

const regulatoryIssues = [
  {
    title: "Clean Water Act / MS4 Permits",
    description: "NAFSMA advocates for reasonable, achievable stormwater permit requirements that reflect the unique challenges facing public agencies.",
  },
  {
    title: "FEMA Flood Mapping",
    description: "Ensuring accurate, up-to-date flood maps that reflect both risks and the mitigation investments made by local agencies.",
  },
  {
    title: "Levee Safety",
    description: "Working with USACE on levee safety standards, inspection programs, and rehabilitation funding for aging flood infrastructure.",
  },
  {
    title: "Environmental Compliance",
    description: "Balancing environmental protection with the practical needs of flood and stormwater infrastructure construction and maintenance.",
  },
];

export default function PolicyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Policy & Advocacy</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              NAFSMA is the unified voice of public flood and stormwater agencies before Congress and federal agencies.
            </p>
          </div>
        </section>

        {/* Advocacy Approach */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-6">Our Advocacy Approach</h2>
            <p className="text-nafsma-warm-gray leading-relaxed mb-4">
              NAFSMA provides a nonpartisan, technically grounded voice in federal policy discussions
              affecting flood and stormwater management. We work directly with Congressional committees,
              agency leadership, and coalition partners to advance practical policies that benefit the
              communities our members protect.
            </p>
            <p className="text-nafsma-warm-gray leading-relaxed">
              Our advocacy is informed by the real-world experience of 200+ member agencies managing
              flood risk and stormwater infrastructure across the country. This ground-level perspective
              makes NAFSMA a trusted resource for policymakers seeking effective solutions.
            </p>
          </div>
        </section>

        {/* Legislative Priorities */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-4">Legislative Priorities</h2>
            <p className="text-center text-nafsma-warm-gray max-w-2xl mx-auto mb-12">
              Key federal legislation shaping the future of flood and stormwater management.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {legislativePriorities.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.slug} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <Icon className="h-8 w-8 text-nafsma-teal" />
                      <span className="text-xs font-semibold px-2 py-1 bg-nafsma-teal/10 text-nafsma-teal rounded-full">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="text-lg mb-3">{item.title}</h3>
                    <p className="text-sm text-nafsma-warm-gray mb-4">{item.description}</p>
                    <Link
                      href={`/policy/${item.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-nafsma-teal hover:text-nafsma-blue"
                    >
                      Read More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Regulatory Issues */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-8">Regulatory Issues</h2>
            <div className="space-y-6">
              {regulatoryIssues.map((issue) => (
                <div key={issue.title} className="border-l-4 border-nafsma-teal pl-6 py-2">
                  <h3 className="text-lg mb-2">{issue.title}</h3>
                  <p className="text-sm text-nafsma-warm-gray">{issue.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-nafsma-teal">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-white mb-4">Get Involved</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              NAFSMA members receive timely policy updates and opportunities to engage directly in the advocacy process.
            </p>
            <Link
              href="/membership/join"
              className="inline-flex items-center px-8 py-3 bg-white text-nafsma-teal font-semibold rounded-md hover:bg-nafsma-light-blue transition-colors"
            >
              Join NAFSMA <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
