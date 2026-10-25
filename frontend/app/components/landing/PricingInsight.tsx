"use client";
import { useState } from "react";

export default function PricingInsight() {
  const [budget, setBudget] = useState(100);

  return (
    <section className="bg-gray-100 px-8 py-16 text-center">
      <h2 className="text-3xl font-bold mb-6">
        Estimate Your Project Cost
      </h2>

      <label htmlFor="budget-slider" className="block mb-4 text-lg">
        Select Budget Range
      </label>
      <input
        id="budget-slider"
        type="range"
        min="100"
        max="10000"
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        className="w-full max-w-xl"
        aria-label="Select Budget Range"
        title="Select Budget Range"
        aria-valuemin={100}
        aria-valuemax={10000}
        aria-valuenow={budget}
        aria-valuetext={`$${budget}`}
      />

      <p className="mt-4 text-xl">
        Estimated Budget: <strong>${budget}</strong>
      </p>
    </section>
  );
}