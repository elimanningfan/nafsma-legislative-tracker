import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Membership',
  description:
    'Join NAFSMA and gain access to federal policy advocacy, networking, resources, and more for your flood and stormwater management agency.',
};

const agencyDues = [
  { population: '100,000 or fewer', amount: '$1,500' },
  { population: '100,001 - 300,000', amount: '$2,500' },
  { population: '300,001 - 500,000', amount: '$4,000' },
  { population: '500,001 - 1,000,000', amount: '$6,000' },
  { population: '1,000,001 - 2,000,000', amount: '$7,500' },
  { population: '2,000,001+', amount: '$9,500' },
];

const associateDues = [
  { size: '1 - 30 employees', amount: '$2,000' },
  { size: '31 - 100 employees', amount: '$3,000' },
  { size: '100+ employees', amount: '$4,000' },
];

const benefits = [
  'Federal policy advocacy on Capitol Hill for flood and stormwater issues',
  'Direct input on legislative and regulatory priorities',
  'Access to the annual NAFSMA Conference and Fly-In events',
  'Mentoring program connecting experienced and emerging leaders',
  'Members-only resource library with guides, position papers, and recordings',
  'Networking with 200+ public agencies and industry partners nationwide',
  'Committee participation (Legislative, Stormwater, Floodplain Management)',
  'Regular newsletters and policy updates',
  'National recognition through the NAFSMA Awards Program',
  'Opportunities to shape the future of flood and stormwater management',
];

export default function MembershipPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-r from-nafsma-blue to-nafsma-dark-navy text-white py-16 md:py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-h1-mobile md:text-h1 mb-4">
              Join the National Voice for Flood & Stormwater
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              NAFSMA represents over 200 public agencies nationwide, advocating
              federal policy that protects communities. Membership gives your
              agency a seat at the table.
            </p>
            <Link
              href="/membership/join"
              className="inline-flex items-center px-8 py-3.5 bg-white text-nafsma-blue font-semibold rounded-md hover:bg-blue-50 transition-colors text-lg"
            >
              Apply for Membership
            </Link>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-h2 text-nafsma-blue text-center mb-10">
              Membership Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex gap-3 items-start">
                  <CheckCircle2 className="h-5 w-5 text-nafsma-teal mt-0.5 flex-shrink-0" />
                  <p className="text-nafsma-warm-gray">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dues Tables */}
        <section className="py-16 bg-nafsma-light-blue">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-h2 text-nafsma-blue text-center mb-4">
              Annual Membership Dues
            </h2>
            <p className="text-center text-nafsma-warm-gray mb-10 max-w-2xl mx-auto">
              Dues are based on population served (agency members) or number of
              employees (associate members). All dues are annual.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Agency Dues */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-nafsma-blue text-white px-6 py-4">
                  <h3 className="text-lg font-semibold">Agency Members</h3>
                  <p className="text-blue-200 text-sm">
                    Based on population served
                  </p>
                </div>
                <div className="divide-y">
                  {agencyDues.map((row) => (
                    <div
                      key={row.population}
                      className="flex justify-between items-center px-6 py-3.5"
                    >
                      <span className="text-sm text-nafsma-warm-gray">
                        {row.population}
                      </span>
                      <span className="font-semibold text-nafsma-blue">
                        {row.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Associate Dues */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-nafsma-teal text-white px-6 py-4">
                  <h3 className="text-lg font-semibold">Associate Members</h3>
                  <p className="text-teal-100 text-sm">
                    Based on number of employees
                  </p>
                </div>
                <div className="divide-y">
                  {associateDues.map((row) => (
                    <div
                      key={row.size}
                      className="flex justify-between items-center px-6 py-3.5"
                    >
                      <span className="text-sm text-nafsma-warm-gray">
                        {row.size}
                      </span>
                      <span className="font-semibold text-nafsma-teal">
                        {row.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h2 className="text-h2 text-nafsma-blue mb-4">Ready to Join?</h2>
            <p className="text-nafsma-warm-gray mb-8 leading-relaxed">
              Complete the membership application and our team will review it
              promptly. Questions? Contact us at{' '}
              <a
                href="mailto:jennifer@nafsma.org"
                className="text-nafsma-teal hover:text-nafsma-blue font-medium"
              >
                jennifer@nafsma.org
              </a>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/membership/join"
                className="inline-flex items-center justify-center px-8 py-3 bg-nafsma-blue text-white font-semibold rounded-md hover:bg-nafsma-dark-navy transition-colors"
              >
                Apply Now
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-nafsma-blue text-nafsma-blue font-semibold rounded-md hover:bg-nafsma-light-blue transition-colors"
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
