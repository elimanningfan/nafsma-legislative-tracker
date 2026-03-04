import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArrowLeft, CheckCircle, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply for an Award",
  description: "Application information for NAFSMA Awards recognizing innovation in flood and stormwater management.",
};

const timelineSteps = [
  { date: "Spring 2026", label: "Applications Open" },
  { date: "June 2026", label: "Submission Deadline" },
  { date: "July 2026", label: "Judging Period" },
  { date: "August 2026", label: "Winners Announced at Annual Meeting" },
];

export default function AwardsApplyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              href="/awards"
              className="inline-flex items-center text-blue-200 hover:text-white text-sm mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Awards
            </Link>
            <h1 className="text-white">Apply for a NAFSMA Award</h1>
            <p className="text-blue-100 mt-4">
              Nominate your agency or project for recognition at the NAFSMA Annual Meeting.
            </p>
          </div>
        </section>

        {/* Eligibility */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-6">Eligibility</h2>
            <div className="space-y-4">
              {[
                "Applicant agency must be a current NAFSMA member in good standing",
                "Projects must be substantially completed and operational",
                "Communications entries must have been published or distributed within the past two years",
                "Self-nominations and peer nominations are both accepted",
                "Previous winners may apply for different projects",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-nafsma-teal flex-shrink-0 mt-0.5" />
                  <p className="text-nafsma-warm-gray">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Judging Criteria */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="mb-8">Judging Criteria</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg mb-4">Innovative Project Award</h3>
                <ul className="space-y-2">
                  {[
                    "Innovation in design or approach (25%)",
                    "Effectiveness in reducing risk (25%)",
                    "Community benefit and engagement (25%)",
                    "Transferability and replication potential (25%)",
                  ].map((c) => (
                    <li key={c} className="text-sm text-nafsma-warm-gray flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-nafsma-teal rounded-full mt-2 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg mb-4">Communications Award</h3>
                <ul className="space-y-2">
                  {[
                    "Creativity and quality of materials (25%)",
                    "Reach and audience engagement (25%)",
                    "Advancement of public understanding (25%)",
                    "Multi-channel strategy (25%)",
                  ].map((c) => (
                    <li key={c} className="text-sm text-nafsma-warm-gray flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-nafsma-teal rounded-full mt-2 flex-shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-center mb-12">Application Timeline</h2>
            <div className="space-y-6">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-nafsma-teal rounded-full flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-nafsma-blue">{step.date}</p>
                    <p className="text-sm text-nafsma-warm-gray">{step.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-nafsma-teal">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-white mb-4">Ready to Apply?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Contact NAFSMA for the current application form and submission instructions.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-nafsma-teal font-semibold rounded-md hover:bg-nafsma-light-blue transition-colors"
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
