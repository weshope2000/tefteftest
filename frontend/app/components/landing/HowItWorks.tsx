"use client";
import { useState } from "react";

export default function HowItWorks() {
  const [mode, setMode] = useState("hire");

  return (
    <section className="px-8 py-20">
      <div className="text-center mb-8">
        <button onClick={() => setMode("hire")} className="mr-4">
          For hiring
        </button>
        <button onClick={() => setMode("work")}>
          For finding work
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="font-semibold text-lg">1. Post a Job</h3>
          <p>Use AI or manually create your listing.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">2. Hire Talent</h3>
          <p>Review proposals and select the best match.</p>
        </div>
        <div>
          <h3 className="font-semibold text-lg">3. Pay Securely</h3>
          <p>Escrow-protected payments after approval.</p>
        </div>
      </div>
    </section>
  );
}