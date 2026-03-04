import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NAFSMA privacy policy regarding collection and use of personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Privacy Policy</h1>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-3xl prose prose-lg">
            <p className="text-sm text-nafsma-warm-gray/60">Last updated: January 2026</p>

            <h2>Overview</h2>
            <p>
              The National Association of Flood and Stormwater Management Agencies (NAFSMA)
              is committed to protecting your privacy. This policy describes how we collect,
              use, and safeguard personal information.
            </p>

            <h2>Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li><strong>Contact information:</strong> Name, email address, phone number, and organization when you fill out forms or contact us.</li>
              <li><strong>Membership information:</strong> Organization details, membership type, and billing information for member agencies.</li>
              <li><strong>Event registration:</strong> Registration details for conferences, webinars, and other NAFSMA events.</li>
              <li><strong>Website usage:</strong> Cookies and analytics data to improve our website experience.</li>
            </ul>

            <h2>How We Use Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process membership applications and renewals</li>
              <li>Register you for events and webinars</li>
              <li>Respond to contact form submissions</li>
              <li>Send policy updates, newsletters, and event announcements to members</li>
              <li>Improve our website and services</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>
              NAFSMA does not sell, rent, or trade personal information to third parties.
              We may share information with service providers who assist in operating our
              website and managing membership, subject to confidentiality agreements.
            </p>

            <h2>Data Security</h2>
            <p>
              We implement reasonable security measures to protect personal information
              from unauthorized access, alteration, or destruction. However, no method
              of internet transmission or electronic storage is completely secure.
            </p>

            <h2>Cookies</h2>
            <p>
              Our website uses cookies for essential functionality and analytics.
              You can control cookie settings through your browser. Disabling cookies
              may affect some website features.
            </p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your personal information</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
            </ul>

            <h2>Contact</h2>
            <p>
              For privacy-related questions or requests, contact us at{" "}
              <a href="mailto:info@nafsma.org">info@nafsma.org</a> or call (202) 289-8625.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
