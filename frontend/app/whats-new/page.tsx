import { Navbar } from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

export default function WhatIsNewPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">What's New</h1>
        <p className="text-gray-600 text-lg max-w-2xl">
          Stay up to date with the latest features, updates, and announcements
          from the Teftef platform.
        </p>
      </div>
      <Footer />
    </>
  );
}