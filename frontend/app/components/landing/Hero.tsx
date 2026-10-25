import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative bg-green-50">
      <div className="container mx-auto px-8 py-20 flex flex-col md:flex-row items-center justify-between">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Add talent without the headcount
          </h1>
          <p className="text-gray-700 mb-6">
            Find skilled freelancers for your projects quickly. Post jobs, receive proposals, and hire securely.
          </p>
          <div className="flex space-x-4">
            <Link
              href="#"
              className="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
            >
              I want to hire
            </Link>
            <Link
              href="#"
              className="px-6 py-3 border border-green-600 text-green-600 rounded hover:bg-green-50 transition"
            >
              I want to work
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};