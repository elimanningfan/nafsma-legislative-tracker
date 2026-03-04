export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Board of Directors",
  description: "Meet the NAFSMA Board of Directors leading federal flood and stormwater policy advocacy.",
};

const defaultBoard = [
  { name: "Board Chair", title: "Chair", agency: "Member Agency", state: "" },
  { name: "Board Vice Chair", title: "Vice Chair", agency: "Member Agency", state: "" },
  { name: "Board Treasurer", title: "Treasurer", agency: "Member Agency", state: "" },
  { name: "Board Secretary", title: "Secretary", agency: "Member Agency", state: "" },
];

async function getBoardContent() {
  try {
    const board = await prisma.editableContent.findMany({
      where: { pageSlug: "about-board", section: "board" },
      orderBy: { order: "asc" },
    });
    return board;
  } catch {
    return [];
  }
}

export default async function BoardPage() {
  const boardContent = await getBoardContent();

  const boardList =
    boardContent.length > 0
      ? boardContent.map((b) => {
          try {
            return JSON.parse(b.content);
          } catch {
            return { name: b.label, title: "", agency: "", state: b.content };
          }
        })
      : defaultBoard;

  return (
    <>
      <Header />
      <main>
        <section className="bg-nafsma-blue py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-white text-center">Board of Directors</h1>
            <p className="text-center text-blue-100 mt-4 max-w-2xl mx-auto">
              NAFSMA is governed by a Board of Directors elected from our member agencies.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardList.map((person: { name: string; title: string; agency: string; state: string }, idx: number) => (
                <div key={idx} className="bg-nafsma-light-blue rounded-lg p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-nafsma-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-nafsma-blue font-bold text-lg">
                      {person.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <h3 className="text-lg mb-1">{person.name}</h3>
                  {person.title && (
                    <p className="text-nafsma-teal font-medium text-sm mb-2">{person.title}</p>
                  )}
                  {person.agency && (
                    <p className="text-nafsma-warm-gray text-sm">{person.agency}</p>
                  )}
                  {person.state && (
                    <p className="text-nafsma-warm-gray/70 text-xs mt-1">{person.state}</p>
                  )}
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
