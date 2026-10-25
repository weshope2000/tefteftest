import { Navbar } from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";

export default function MessagesPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
        <p className="text-gray-600">Chat with clients and freelancers.</p>
      </div>
      <Footer />
    </>
  );
}