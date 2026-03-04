import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PolicyDetail = {
  title: string;
  description: string;
  content: string;
  status: string;
};

const policyDetails: Record<string, PolicyDetail> = {
  "wrda-2026": {
    title: "WRDA 2026",
    description: "Water Resources Development Act 2026",
    status: "Active Priority",
    content: `
The Water Resources Development Act (WRDA) is Congress's primary vehicle for authorizing U.S. Army Corps of Engineers (USACE) water resources projects and policies. NAFSMA actively advocates for WRDA provisions that benefit member agencies and the communities they serve.

## NAFSMA Priorities for WRDA 2026

### Project Authorization and Delivery
- Streamlined study and construction timelines for flood risk management projects
- Improved cost-sharing frameworks that reflect local fiscal realities
- Authorization of new projects critical to member agencies

### Policy Reforms
- Enhanced flexibility in project cost-sharing and financing
- Improved levee safety and rehabilitation authorities
- Updated dam safety requirements and funding
- Nature-based solutions integration into project planning

### Emerging Challenges
- Climate resilience provisions for existing and new infrastructure
- Compound flooding (coastal + riverine + stormwater) recognition
- Equity considerations in project prioritization

## How Members Can Help
NAFSMA coordinates Congressional outreach during key legislative windows. Members are encouraged to share project stories, data, and testimony needs with NAFSMA staff.
    `,
  },
  "fy26-appropriations": {
    title: "FY26 Appropriations",
    description: "Federal Fiscal Year 2026 Funding Priorities",
    status: "Active Priority",
    content: `
Federal appropriations determine annual funding levels for the programs most critical to NAFSMA members. We advocate for robust funding across multiple agencies.

## USACE Civil Works
- Construction funding for authorized flood risk management projects
- Operations and maintenance for existing federal flood infrastructure
- Investigations funding for new project studies
- Flood risk management and environmental restoration

## FEMA Flood Mitigation
- Hazard Mitigation Grant Program (HMGP) funding
- Flood Mitigation Assistance (FMA) program
- Building Resilient Infrastructure and Communities (BRIC) grants
- National Flood Insurance Program operational support

## EPA Stormwater Programs
- Clean Water State Revolving Fund (CWSRF)
- Green infrastructure and water quality improvement grants
- MS4 compliance assistance programs
- Water infrastructure finance and innovation

## NAFSMA Advocacy
NAFSMA submits detailed appropriations testimony to relevant Congressional committees each year and coordinates with coalition partners to maximize the impact of our funding requests.
    `,
  },
  "nfip-reauthorization": {
    title: "NFIP Reauthorization",
    description: "National Flood Insurance Program Long-Term Reauthorization",
    status: "Active Priority",
    content: `
The National Flood Insurance Program (NFIP) is critical to flood risk management nationwide but has operated on short-term extensions for years. NAFSMA advocates for a comprehensive, long-term reauthorization.

## NAFSMA Position

### Affordability
- Gradual premium adjustments that do not price out communities
- Means-tested assistance for low-income policyholders
- Recognition of community-level mitigation investments in pricing

### Mapping Accuracy
- Adequate funding for modern flood map production
- Appeals process improvements for mapping disputes
- Integration of local data and studies into federal mapping

### Mitigation Incentives
- Enhanced Community Rating System (CRS) credits
- Increased Severe Repetitive Loss property buyout funding
- Support for community-level flood mitigation planning

### Program Sustainability
- Addressing the NFIP debt in a way that does not burden policyholders
- Encouraging private market participation alongside federal coverage
- Improving claims processing and policyholder experience

## Current Status
NAFSMA continues to work with both chambers of Congress on comprehensive reauthorization legislation. We support bipartisan approaches that balance program sustainability with community affordability.
    `,
  },
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = policyDetails[slug];
  if (!policy) return { title: "Policy" };
  return {
    title: policy.title,
    description: policy.description,
  };
}

export default async function PolicyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const policy = policyDetails[slug];

  if (!policy) {
    notFound();
  }

  // Convert markdown-like content to HTML sections
  const contentSections = policy.content
    .trim()
    .split("\n")
    .map((line) => line.trim());

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/policy"
                className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-4"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Policy & Advocacy
              </Link>
              <h1 className="text-white">{policy.title}</h1>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs font-semibold px-3 py-1 bg-nafsma-teal text-white rounded-full">
                  {policy.status}
                </span>
                <p className="text-blue-100">{policy.description}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none">
              {contentSections.map((line, idx) => {
                if (line.startsWith("## ")) {
                  return <h2 key={idx} className="mt-10 mb-4">{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={idx} className="mt-6 mb-2">{line.replace("### ", "")}</h3>;
                }
                if (line.startsWith("- ")) {
                  return (
                    <li key={idx} className="text-nafsma-warm-gray ml-6 list-disc">
                      {line.replace("- ", "")}
                    </li>
                  );
                }
                if (line === "") return null;
                return <p key={idx} className="text-nafsma-warm-gray mb-4">{line}</p>;
              })}
            </div>

            <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between gap-4">
              <Link
                href="/policy"
                className="inline-flex items-center text-nafsma-teal hover:text-nafsma-blue font-semibold"
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> All Policy Priorities
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center text-nafsma-teal hover:text-nafsma-blue font-semibold"
              >
                Questions? Contact Us <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
