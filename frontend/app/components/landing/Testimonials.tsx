export default function Testimonials() {
  return (
    <section className="bg-gray-50 px-8 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">
        Success Stories
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-yellow-500">★★★★★</p>
            <p className="mt-4 text-gray-600">
              “Amazing developer delivered our AI dashboard ahead of schedule.”
            </p>
            <p className="mt-4 font-semibold">John Doe</p>
            <span className="text-sm text-gray-500">Dev & IT</span>
          </div>
        ))}
      </div>
    </section>
  );
}