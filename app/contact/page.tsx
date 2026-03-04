import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ContactForm } from "@/components/public/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact NAFSMA for questions about membership, events, policy, or general inquiries.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Contact Us</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              Have a question? We would love to hear from you.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {/* Contact Info */}
              <div>
                <h2 className="text-xl mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-nafsma-teal mt-1" />
                    <div>
                      <p className="font-medium text-nafsma-blue text-sm">Email</p>
                      <a
                        href="mailto:info@nafsma.org"
                        className="text-nafsma-warm-gray text-sm hover:text-nafsma-teal"
                      >
                        info@nafsma.org
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-nafsma-teal mt-1" />
                    <div>
                      <p className="font-medium text-nafsma-blue text-sm">Phone</p>
                      <a
                        href="tel:2022898625"
                        className="text-nafsma-warm-gray text-sm hover:text-nafsma-teal"
                      >
                        (202) 289-8625
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-nafsma-teal mt-1" />
                    <div>
                      <p className="font-medium text-nafsma-blue text-sm">Office</p>
                      <p className="text-nafsma-warm-gray text-sm">Washington, DC</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
