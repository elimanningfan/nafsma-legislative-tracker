export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Staff",
  description: "Meet the NAFSMA staff team working on federal flood and stormwater policy advocacy.",
};

const defaultStaff = [
  {
    name: "Susan Gilson",
    title: "Executive Director",
    email: "sgilson@nafsma.org",
    bio: "Susan leads NAFSMA's federal advocacy, member engagement, and strategic direction. She has over 20 years of experience in water resources policy.",
  },
  {
    name: "Staff Member",
    title: "Policy Director",
    email: "info@nafsma.org",
    bio: "Leads NAFSMA's legislative and regulatory analysis on flood and stormwater policy issues.",
  },
];

async function getStaffContent() {
  try {
    const staff = await prisma.editableContent.findMany({
      where: { pageSlug: "about-staff", section: "staff" },
      orderBy: { order: "asc" },
    });
    return staff;
  } catch {
    return [];
  }
}

export default async function StaffPage() {
  const staffContent = await getStaffContent();

  const staffList =
    staffContent.length > 0
      ? staffContent.map((s) => {
          try {
            return JSON.parse(s.content);
          } catch {
            return { name: s.label, title: "", email: "", bio: s.content };
          }
        })
      : defaultStaff;

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Staff</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              Meet the team advocating for flood and stormwater agencies in Washington.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8">
              {staffList.map((person: { name: string; title: string; email: string; bio: string }, idx: number) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 bg-nafsma-light-blue rounded-lg">
                  <div className="flex-shrink-0 w-24 h-24 bg-nafsma-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-nafsma-blue font-bold text-2xl">
                      {person.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl mb-1">{person.name}</h3>
                    {person.title && (
                      <p className="text-nafsma-teal font-medium text-sm mb-3">{person.title}</p>
                    )}
                    {person.bio && (
                      <p className="text-nafsma-warm-gray text-sm mb-3">{person.bio}</p>
                    )}
                    {person.email && (
                      <a
                        href={`mailto:${person.email}`}
                        className="inline-flex items-center text-sm text-nafsma-teal hover:text-nafsma-blue"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {person.email}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
