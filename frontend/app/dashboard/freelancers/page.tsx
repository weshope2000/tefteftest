"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Skill {
  name: string;
}

interface Freelancer {
  user_id: string;
  full_name: string;
  bio: string;
  skills: string[];
}

const CATEGORIES = [
  "Software Development",
  "Graphic Design",
  "Writing & Translation",
  "Marketing & Sales",
  "Customer Support",
  "Data & Analytics",
];

export default function FindFreelancersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/freelancers");
        const list = Array.isArray(res.data) ? res.data : [];
        const enriched = await Promise.all(
          list.map(async (f: any) => {
            let skills: string[] = [];
            try {
              const s = await api.get(`/skills/${f.user_id}`);
              skills = Array.isArray(s.data) ? s.data.map((x: any) => x.skill_name || x.name) : [];
            } catch {}
            return { ...f, skills };
          })
        );
        if (mounted) setFreelancers(enriched);
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  const filtered = freelancers
    .filter((f) => {
      const text = `${f.full_name} ${f.bio} ${f.skills.join(" ")}`.toLowerCase();
      const matchesName = text.includes(search.trim().toLowerCase());
      const matchesSkill = !skillFilter || f.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));
      return matchesName && matchesSkill;
    })
    .sort((a, b) => {
      if (sort === "name") return (a.full_name || "").localeCompare(b.full_name || "");
      if (sort === "skills") return b.skills.length - a.skills.length;
      if (sort === "relevance") return b.skills.length - a.skills.length;
      if (sort === "experience") return b.skills.length - a.skills.length;
      if (sort === "rating") return 0;
      if (sort === "price") return 0;
      return 0;
    });

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Freelancers</h1>
        <p className="text-gray-600 mb-6">
          Search and discover freelancers by name, skill, or keyword.
        </p>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, or keyword"
            className="border rounded px-4 py-2 w-full md:w-72 text-sm"
          />
          <input
            type="text"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            placeholder="Filter by skill"
            className="border rounded px-4 py-2 w-full md:w-56 text-sm"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="relevance">Sort: Relevance</option>
            <option value="name">Sort: Name</option>
            <option value="skills">Sort: Most skills</option>
            <option value="experience">Sort: Experience</option>
            <option value="rating">Sort: Rating</option>
            <option value="price">Sort: Price</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1 rounded-full text-sm ${category === "all" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-sm ${category === c ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No freelancers found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((f) => (
              <div key={f.user_id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                    {(f.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{f.full_name || "Freelancer"}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">{f.bio || "No bio provided."}</p>
                {f.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {f.skills.slice(0, 6).map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {s}
                      </span>
                    ))}
                    {f.skills.length > 6 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{f.skills.length - 6}
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => router.push(`/freelancers/${f.user_id}`)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700"
                >
                  View profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}