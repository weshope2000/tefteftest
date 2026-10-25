export default function PlanComparison() {
  return (
    <section className="px-8 py-20 bg-white">
      <h2 className="text-3xl font-bold text-center mb-12">
        Choose Your Plan
      </h2>

      <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">

        <div className="border p-8 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Basic</h3>
          <ul className="space-y-2">
            <li>Marketplace access</li>
            <li>Talent profiles</li>
            <li>Hiring tools</li>
            <li>Escrow-protected payments</li>
          </ul>
          <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded">
            Get Started
          </button>
        </div>

        <div className="border-2 border-green-600 p-8 rounded-lg relative">
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            Popular
          </span>
          <h3 className="text-xl font-semibold mb-4">
            Business Plus
          </h3>
          <ul className="space-y-2">
            <li>Curated shortlists</li>
            <li>Expert-vetted talent</li>
            <li>Team workspace</li>
            <li>Priority support</li>
          </ul>
          <button className="mt-6 bg-green-600 text-white px-6 py-2 rounded">
            Upgrade
          </button>
        </div>

      </div>
    </section>
  );
}