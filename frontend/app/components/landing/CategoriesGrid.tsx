const categories = [
  "AI Services",
  "Development & IT",
  "Design & Creative",
  "Sales & Marketing",
  "Writing & Translation",
  "Admin & Support",
  "Finance & Accounting",
  "Legal",
  "HR & Training",
  "Engineering & Architecture",
];

export default function CategoriesGrid() {
  return (
    <section className="px-8 py-16 bg-gray-50">
      <h2 className="text-3xl font-bold mb-10 text-center">
        Browse Talent by Category
      </h2>

      <div className="grid md:grid-cols-5 gap-6">
        {categories.map((cat) => (
          <div
            key={cat}
            className="bg-white shadow-sm p-6 rounded-lg hover:shadow-md cursor-pointer"
          >
            {cat}
          </div>
        ))}
      </div>
    </section>
  );
}