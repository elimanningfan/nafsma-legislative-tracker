import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h1 className="text-nafsma-blue">NAFSMA</h1>
            <p className="mt-4 text-nafsma-warm-gray text-body">
              Driving Flood and Stormwater Policy That Benefits Our Communities
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
