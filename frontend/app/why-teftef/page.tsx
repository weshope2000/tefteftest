import { Navbar } from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

export default function WhyTeftefPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Why Teftef</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Teftef is the fastest-growing freelance marketplace connecting
          businesses with top-tier talent worldwide.
        </p>
      </div>
      <Footer />
    </>
  );
}