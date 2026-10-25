"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import api, { errorMessage } from "@/lib/api";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<
    {
      id: string;
      title: string;
      description: string;
      skills: string;
      budget: number;
      type: string;
      status: string;
      delivery_days: number;
    }[]
  >([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirements: "",
    skills: "",
    budget: "",
    type: "fixed",
    deliveryDays: "",
    proposalsDisclosed: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await api.post("/jobs", {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        skills: form.skills,
        budget: parseFloat(form.budget) || 0,
        type: form.type,
        delivery_days: parseInt(form.deliveryDays) || 0,
        proposals_disclosed: form.proposalsDisclosed,
      });
      setJobs([res.data, ...jobs]);
      setForm({
        title: "",
        description: "",
        requirements: "",
        skills: "",
        budget: "",
        type: "fixed",
        deliveryDays: "",
        proposalsDisclosed: true,
      });
    } catch (err: unknown) {
      setError(errorMessage(err, "Failed to create job"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Jobs</h1>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={create} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
          <h2 className="font-semibold text-lg">Create a new job</h2>
          <input
            type="text"
            placeholder="Job title"
            className="w-full border rounded px-4 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full border rounded px-4 py-2 h-24"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <textarea
            placeholder="Requirements (skills, qualifications and deliverables expected)"
            className="w-full border rounded px-4 py-2 h-20"
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          />
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Skills (comma separated)"
              className="flex-1 border rounded px-4 py-2"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
            <input
              type="number"
              placeholder="Budget ($)"
              className="w-40 border rounded px-4 py-2"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
            <input
              type="number"
              min="0"
              placeholder="Delivery (days)"
              className="w-40 border rounded px-4 py-2"
              value={form.deliveryDays}
              onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
            />
            <select
              className="border rounded px-4 py-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.proposalsDisclosed}
              onChange={(e) => setForm({ ...form, proposalsDisclosed: e.target.checked })}
            />
            Show the number of proposals to freelancers
          </label>
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create job"}
          </button>
        </form>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs yet. Create one above.</p>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-semibold text-lg hover:underline"
                    >
                      {job.title}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Skills: {job.skills}</span>
                      <span>Budget: ${job.budget}</span>
                      <span className="capitalize">Type: {job.type}</span>
                      {job.delivery_days > 0 && (
                        <span>Delivery: {job.delivery_days} days</span>
                      )}
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 shrink-0"
                  >
                    View listing
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
