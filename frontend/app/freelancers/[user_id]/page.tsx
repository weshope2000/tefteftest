"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  name: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  professional_title: string;
  photo_url: string;
  location: string;
  bio: string;
  experience: string;
  education: string;
  certifications: string;
  hourly_rate: number;
  monthly_rate: number;
  fixed_price: boolean;
  weekly_capacity: string;
  start_date: string;
  availability: string;
  verification_status: string;
  languages: string;
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  feedback: string;
  created_at: string;
}

export default function FreelancerProfilePage({ params }: { params: Promise<{ user_id: string }> }) {
  const { user_id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const p = await api.get(`/profile/${user_id}`);
        if (!mounted) return;
        if (p.data) setProfile(p.data);
        else setNotFound(true);
      } catch {
        if (mounted) setNotFound(true);
      }
      try {
        const s = await api.get(`/skills/${user_id}`);
        if (mounted && Array.isArray(s.data)) setSkills(s.data);
      } catch {}
      try {
        const pf = await api.get(`/portfolio/${user_id}`);
        if (mounted && Array.isArray(pf.data)) setPortfolio(pf.data);
      } catch {}
      try {
        const r = await api.get(`/reviews?reviewee_id=${user_id}`);
        if (mounted && Array.isArray(r.data)) setReviews(r.data);
      } catch {}
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [user, router, user_id]);

  if (loading) {
    return (
      <div className="px-8 py-12"><p className="text-gray-500">Loading profile...</p></div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="px-8 py-12"><p className="text-gray-500">Freelancer not found.</p></div>
    );
  }

  const completion = () => {
    const items = [
      { name: "Full name", done: !!profile.full_name },
      { name: "Professional title", done: !!profile.professional_title },
      { name: "Location", done: !!profile.location },
      { name: "Biography", done: !!profile.bio },
      { name: "Skills", done: skills.length > 0 },
      { name: "Experience", done: !!profile.experience },
      { name: "Education", done: !!profile.education },
      { name: "Pricing", done: !!profile.hourly_rate },
      { name: "Languages", done: !!profile.languages },
    ];
    const done = items.filter((i) => i.done).length;
    return { percent: Math.round((done / items.length) * 100), items };
  };

  const { percent, items } = completion();
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const tabs = ["About", "Skills", "Experience", "Portfolio", "Education", "Reviews", "Availability"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ marginLeft: 24, marginRight: 24, gap: 24 }}>
        <main className="flex-1" style={{ maxWidth: 812 }}>
          <button onClick={() => router.back()} className="text-sm text-green-600 hover:underline mb-4">
            Back to search
          </button>

          <div className="bg-white rounded-lg shadow-md p-5 mb-4" style={{ width: 1136, height: 220 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-28 h-28 rounded-full bg-green-600 text-white flex items-center justify-center text-4xl font-semibold relative">
                {(profile.full_name || "?").charAt(0).toUpperCase()}
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-xs">📷</button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name || "Freelancer"}</h1>
                {profile.professional_title && <p className="text-gray-600 mt-1">{profile.professional_title}</p>}
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  {profile.location && <span>{profile.location}</span>}
                  {profile.availability && <span className="capitalize">{profile.availability}</span>}
                  {profile.verification_status === "verified" && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Verified</span>
                  )}
                  {avgRating && <span>⭐ {avgRating} ({reviews.length} reviews)</span>}
                </div>
                {profile.bio && <p className="text-gray-700 mt-3" style={{ maxWidth: 590 }}>{profile.bio}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700" style={{ width: 180, height: 40 }}>Message</button>
              <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50" style={{ width: 180, height: 40 }}>Save</button>
              <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50" style={{ width: 180, height: 40 }}>Invite to Job</button>
              <button className="px-4 py-2 border rounded text-sm hover:bg-gray-50 text-gray-500" style={{ width: 180, height: 40 }}>Report</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md mb-4" style={{ width: 1136, height: 48 }}>
            <div className="flex gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === tab.toLowerCase() ? "border-b-2 border-green-600 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                  style={{ width: tab === "Experience" ? 110 : tab === "Portfolio" ? 100 : tab === "Education" ? 100 : tab === "Availability" ? 120 : 80, height: 48 }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5 mb-4" style={{ width: 812 }}>
            {activeTab === "about" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About Me</h2>
                <p className="text-gray-700">{profile.bio || "No bio provided yet."}</p>
              </div>
            )}

            {activeTab === "skills" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills & Expertise</h2>
                {skills.length === 0 ? (
                  <p className="text-gray-500 text-sm">No skills listed.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s.id} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "experience" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Work Experience</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.experience || "No experience listed."}</p>
              </div>
            )}

            {activeTab === "portfolio" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Portfolio</h2>
                {portfolio.length === 0 ? (
                  <p className="text-gray-500 text-sm">No portfolio items yet.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {portfolio.map((p) => (
                      <div key={p.id} className="border rounded" style={{ width: 180, height: 180 }}>
                        <div className="bg-gray-100" style={{ width: 180, height: 100 }} />
                        <div className="p-2">
                          <h3 className="font-semibold text-gray-900 text-sm" style={{ width: 180, height: 24 }}>{p.title}</h3>
                          <p className="text-gray-500 text-xs" style={{ width: 180, height: 20 }}>{p.description?.slice(0, 30)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "education" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Education & Certifications</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.education || "No education listed."}</p>
                {profile.certifications && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-1">Certifications</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{profile.certifications}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Reviews & Ratings</h2>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border rounded p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                          <span className="text-gray-400 text-sm">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{r.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "availability" && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Pricing & Availability</h2>
                <div className="grid grid-cols-2 gap-4">
                  {profile.hourly_rate ? <div><p className="text-xs text-gray-500">Hourly rate</p><p className="font-semibold">${profile.hourly_rate}/hr</p></div> : null}
                  {profile.monthly_rate ? <div><p className="text-xs text-gray-500">Monthly rate</p><p className="font-semibold">${profile.monthly_rate}/mo</p></div> : null}
                  {profile.fixed_price ? <div><p className="text-xs text-gray-500">Pricing model</p><p className="font-semibold">Fixed price preferred</p></div> : null}
                  {profile.weekly_capacity ? <div><p className="text-xs text-gray-500">Weekly capacity</p><p className="font-semibold">{profile.weekly_capacity}</p></div> : null}
                  {profile.start_date ? <div><p className="text-xs text-gray-500">Start date</p><p className="font-semibold">{profile.start_date}</p></div> : null}
                  {profile.availability ? <div><p className="text-xs text-gray-500">Availability</p><p className="font-semibold capitalize">{profile.availability}</p></div> : null}
                  {profile.languages ? <div className="col-span-2"><p className="text-xs text-gray-500">Languages</p><p className="font-semibold">{profile.languages}</p></div> : null}
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className="space-y-4" style={{ width: 300, paddingTop: 88 }}>
          <div className="bg-white rounded-lg shadow-md p-4" style={{ width: 300, height: 150 }}>
            <h3 className="font-semibold text-gray-900 mb-2" style={{ width: 268, height: 24 }}>Profile Completion</h3>
            <div className="flex items-center gap-2 mb-2" style={{ width: 268, height: 8 }}>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full" style={{ width: `${percent}%` }} />
              </div>
              <span className="text-sm font-medium">{percent}%</span>
            </div>
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={item.done ? "text-green-600" : "text-gray-400"}>{item.done ? "✓" : "○"}</span>
                  <span className={item.done ? "text-gray-700" : "text-gray-400"}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4" style={{ width: 300, height: 180 }}>
            <h3 className="font-semibold text-gray-900 mb-2" style={{ width: 268, height: 36 }}>Pricing</h3>
            {profile.hourly_rate ? <p className="text-sm"><span className="text-gray-500">Hourly:</span> <span className="font-semibold">${profile.hourly_rate}/hr</span></p> : null}
            {profile.monthly_rate ? <p className="text-sm"><span className="text-gray-500">Monthly:</span> <span className="font-semibold">${profile.monthly_rate}/mo</span></p> : null}
            {profile.fixed_price ? <p className="text-sm text-gray-600">Prefers fixed-price projects</p> : null}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4" style={{ width: 300, height: 140 }}>
            <h3 className="font-semibold text-gray-900 mb-2" style={{ width: 268, height: 24 }}>Availability</h3>
            {profile.availability ? <p className="text-sm capitalize">{profile.availability}</p> : null}
            {profile.weekly_capacity ? <p className="text-sm text-gray-600">{profile.weekly_capacity}</p> : null}
            {profile.start_date ? <p className="text-sm text-gray-600">Start: {profile.start_date}</p> : null}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4" style={{ width: 300, height: 120 }}>
            <h3 className="font-semibold text-gray-900 mb-2" style={{ width: 268, height: 24 }}>Languages</h3>
            <p className="text-sm text-gray-700">{profile.languages || "Not specified"}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4" style={{ width: 300, height: 160 }}>
            <h3 className="font-semibold text-gray-900 mb-2" style={{ width: 268, height: 28 }}>Verification</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${profile.verification_status === "verified" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
              {profile.verification_status || "unverified"}
            </span>
            <button className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700" style={{ width: 268, height: 36 }}>Continue Verification</button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4" style={{ width: 300 }}>
            <h3 className="font-semibold text-gray-900 mb-2" style={{ width: 268, height: 24 }}>Help & Guidance</h3>
            <p className="text-sm text-gray-600 mb-2">Need help improving your profile?</p>
            <a href="#" className="text-green-600 text-sm hover:underline">Visit Help Center</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
