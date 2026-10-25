"use client";
import { useState } from "react";

export default function SmartJobInput() {
  const [input, setInput] = useState("");

  return (
    <section className="px-8 py-12 bg-white text-center">
      <h2 className="text-3xl font-semibold mb-6">
        Describe what you need to hire for
      </h2>

      <div className="max-w-2xl mx-auto flex gap-3">
        <input
          className="flex-1 border rounded-md px-4 py-3"
          placeholder="e.g. Build an AI-powered SaaS dashboard..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-green-600 text-white px-6 rounded-md">
          Generate
        </button>
      </div>
    </section>
  );
}