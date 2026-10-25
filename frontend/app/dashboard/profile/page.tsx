"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Skill {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.name || "");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [fixedPrice, setFixedPrice] = useState(false);
  const [weeklyCapacity, setWeeklyCapacity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [availability, setAvailability] = useState("");
  const [languages, setLanguages] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const userID = user?.user_id || user?.id;

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    if (!userID) return;
    const load = async () => {
      try {
        const p = await api.get(`/profile/${userID}`);
        if (p.data) {
          setFullName(p.data.full_name || user?.name || "");
          setProfessionalTitle(p.data.professional_title || "");
          setLocation(p.data.location || "");
          setBio(p.data.bio || "");
          setExperience(p.data.experience || "");
          setEducation(p.data.education || "");
          setCertifications(p.data.certifications || "");
          setHourlyRate(p.data.hourly_rate || "");
          setMonthlyRate(p.data.monthly_rate || "");
          setFixedPrice(p.data.fixed_price || false);
          setWeeklyCapacity(p.data.weekly_capacity || "");
          setStartDate(p.data.start_date || "");
          setAvailability(p.data.availability || "");
          setLanguages(p.data.languages || "");
          setVerificationStatus(p.data.verification_status || "");
        }
        const s = await api.get(`/skills/${userID}`);
        if (Array.isArray(s.data)) setSkills(s.data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setFullName(user?.name || "");
        }
      }
    };
    load();
  }, [user, router, userID]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/profile", {
        user_id: userID,
        full_name: fullName,
        professional_title: professionalTitle,
        location,
        bio,
        experience,
        education,
        certifications,
        hourly_rate: parseFloat(hourlyRate) || 0,
        monthly_rate: parseFloat(monthlyRate) || 0,
        fixed_price: fixedPrice,
        weekly_capacity: weeklyCapacity,
        start_date: startDate,
        availability,
        languages,
        verification_status: verificationStatus,
      });
      setMessage("Profile updated");
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      await api.post("/skills", { user_id: userID, name: newSkill.trim() });
      setSkills((prev) => [...prev, { id: "", name: newSkill.trim() }]);
      setNewSkill("");
    } catch {}
  };

  const removeSkill = async (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  const section = (title: string, content: React.ReactNode) => (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {content}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex">
        <div className="flex-1" style={{ maxWidth: 812 }}>
          <div className="px-8 py-12">
            {message && <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded mb-4">{message}</div>}

            <div className="bg-white rounded-[12px] border border-[#E2E8E4] mb-6" style={{ maxWidth: 1128, padding: 24 }}>
              <div className="flex gap-5">
                <div className="w-[88px] h-[88px] rounded-full bg-[#26734D] text-white flex items-center justify-center text-[20px] font-semibold relative shrink-0">
                  {(fullName || "?").charAt(0).toUpperCase()}
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-xs">📷</button>
                </div>
                <div className="flex-1">
                  <h2 className="text-[24px] font-semibold text-[#172B22] leading-[30px]">{fullName || "Your Name"}</h2>
                  <p className="text-[16px] text-[#52645A] leading-[24px] mt-1">{professionalTitle || "Professional Title"}</p>
                  {location && (
                    <p className="text-[14px] text-[#52645A] leading-[20px] mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {location}
                    </p>
                  )}
                  <div className="text-[13px] leading-[20px] mt-1 flex items-center gap-3 text-[#52645A]">
                    {verificationStatus === "verified" && (
                      <span className="flex items-center gap-1 text-[#26734D]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Verified
                      </span>
                    )}
                    {availability && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#26734D] inline-block" />
                        Available for work
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex gap-8">
                  {hourlyRate && (
                    <div>
                      <p className="text-[20px] font-semibold text-[#172B22] leading-[56px]">{hourlyRate}</p>
                      <p className="text-xs text-[#52645A]">ETB / hour</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[20px] font-semibold text-[#172B22] leading-[56px]">12</p>
                    <p className="text-xs text-[#52645A]">Projects</p>
                  </div>
                  <div>
                    <p className="text-[20px] font-semibold text-[#172B22] leading-[56px]">4.8/5</p>
                    <p className="text-xs text-[#52645A]">Rating</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={() => setEditing(true)} className="bg-[#26734D] text-white rounded-[8px] text-[14px] hover:bg-[#1e5a3d]" style={{ width: 140, height: 40 }}>
                  Edit Profile
                </button>
                <button onClick={() => router.push(`/freelancers/${userID}`)} className="border border-[#E2E8E4] text-[#172B22] rounded-[8px] text-[14px] hover:bg-[#F7F9F7]" style={{ width: 200, height: 40 }}>
                  Preview Public Profile
                </button>
              </div>
            </div>

            {editing && (
              <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6" style={{ maxWidth: 1128 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-semibold text-[#172B22]">Edit Profile</h3>
                  <button onClick={() => setEditing(false)} className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#52645A] hover:bg-[#F7F9F7]">Cancel</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="border rounded px-4 py-2 w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional title</label>
                    <input type="text" value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} placeholder="e.g. Full Stack Developer" className="border rounded px-4 py-2 w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New York, USA" className="border rounded px-4 py-2 w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="border rounded px-4 py-2 w-full text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={6} className="border rounded px-4 py-2 w-full text-sm" placeholder="Describe your work experience..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                      <textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={3} className="border rounded px-4 py-2 w-full text-sm" placeholder="e.g. B.S. Computer Science, MIT, 2020" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                      <textarea value={certifications} onChange={(e) => setCertifications(e.target.value)} rows={3} className="border rounded px-4 py-2 w-full text-sm" placeholder="e.g. AWS Certified Solutions Architect" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditing(false)} className="px-4 py-2 border border-[#E2E8E4] rounded text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={async () => { await handleSave(); setEditing(false); }} disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                      {saving ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-6 border-b border-[#E2E8E4] mb-6" style={{ maxWidth: 1128 }}>
              {["About", "Portfolio", "Experience", "Education", "Review", "Availability"].map((tab) => (
                <button key={tab} className="pb-2 text-[14px] text-[#52645A] hover:text-[#26734D] border-b-2 border-transparent hover:border-[#26734D]">
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6" style={{ maxWidth: 1128 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#172B22]">About Me</h3>
                <button className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#26734D] hover:bg-[#F7F9F7]">Edit</button>
              </div>
              <p className="text-[14px] text-[#52645A]">{bio || "No bio yet."}</p>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6" style={{ maxWidth: 1128 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#172B22]">Skills</h3>
                <button className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#26734D] hover:bg-[#F7F9F7]">Edit</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{s.name}</span>
                ))}
                {skills.length === 0 && <p className="text-[14px] text-[#52645A]">No skills added yet.</p>}
              </div>
            </div>

            <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-6 mb-6" style={{ maxWidth: 1128 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-semibold text-[#172B22]">Experience</h3>
                <button className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#26734D] hover:bg-[#F7F9F7]">Edit</button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-[13px] font-semibold text-[#52645A] mb-2">
                <span>Title</span>
                <span>Duration</span>
                <span>Company</span>
              </div>
              <p className="text-[14px] text-[#52645A]">{experience || "No experience added yet."}</p>
            </div>
            <div className="space-y-6 max-w-3xl">
              {section("Portfolio", (
                <div>
                  <p className="text-sm text-gray-600 mb-3">Manage your portfolio projects from the Portfolio page.</p>
                  <button onClick={() => router.push("/dashboard/portfolio")} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Add Portfolio Project
                  </button>
                </div>
              ))}

              <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Save profile"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4" style={{ width: 300, marginLeft: 24 }}>
          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 300, minHeight: 190 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-3">Profile Completion</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] text-[#52645A]">Profile strength</span>
              <span className="text-[13px] font-semibold text-[#26734D]">75%</span>
            </div>
            <div className="w-full h-2 bg-[#E2E8E4] rounded-full overflow-hidden mb-4">
              <div className="h-full bg-[#26734D] rounded-full" style={{ width: "75%" }} />
            </div>
            <p className="text-[13px] text-[#52645A] mb-3">Complete these items to improve your profile.</p>
            <ul className="space-y-2 text-[13px]">
              <li className="flex items-center gap-2 text-[#26734D] cursor-pointer">+ Add portfolio projects</li>
              <li className="flex items-center gap-2 text-[#26734D] cursor-pointer">+ Add work experience</li>
              <li className="flex items-center gap-2 text-[#26734D] cursor-pointer">+ Complete your biography</li>
            </ul>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 300, minHeight: 240 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[#172B22]">Pricing</h3>
              <button className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#26734D] hover:bg-[#F7F9F7]">Edit</button>
            </div>
            <label className="block text-[13px] text-[#52645A] mb-1">Hourly rate</label>
            <div className="flex gap-2 mb-3">
              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="Amount" className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] flex-1 text-[13px]" />
              <select className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] text-[13px]">
                <option>ETB</option>
                <option>USD</option>
              </select>
            </div>
            <label className="block text-[13px] text-[#52645A] mb-1">Pricing model</label>
            <div className="flex gap-3 mb-3 text-[13px]">
              <label className="flex items-center gap-1"><input type="radio" name="pm" defaultChecked /> Hourly</label>
              <label className="flex items-center gap-1"><input type="radio" name="pm" /> Fixed price</label>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-[#52645A]">
              <input type="checkbox" /> Rate is negotiable
            </label>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 300, minHeight: 220 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[#172B22]">Availability</h3>
              <button className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#26734D] hover:bg-[#F7F9F7]">Edit</button>
            </div>
            <label className="block text-[13px] text-[#52645A] mb-1">Availability status</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] w-full text-[13px] mb-3">
              <option value="">Available for work</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="not-available">Not available</option>
            </select>
            <label className="block text-[13px] text-[#52645A] mb-1">Hours per week</label>
            <input type="text" value={weeklyCapacity} onChange={(e) => setWeeklyCapacity(e.target.value)} placeholder="30 hours" className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] w-full text-[13px] mb-3" />
            <label className="block text-[13px] text-[#52645A] mb-1">Available from</label>
            <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Select start date" className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] w-full text-[13px]" />
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 300, minHeight: 220 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-semibold text-[#172B22]">Languages</h3>
              <button className="px-3 py-1.5 border border-[#E2E8E4] rounded-[8px] text-[13px] text-[#26734D] hover:bg-[#F7F9F7]">Edit</button>
            </div>
            <label className="block text-[13px] text-[#52645A] mb-1">Language</label>
            <input type="text" placeholder="Search languages" className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] w-full text-[13px] mb-3" />
            <label className="block text-[13px] text-[#52645A] mb-1">Proficiency</label>
            <select className="border border-[#E2E8E4] rounded-[8px] px-3 h-[40px] w-full text-[13px] mb-3">
              <option>Fluent</option>
              <option>Native</option>
              <option>Conversational</option>
              <option>Basic</option>
            </select>
            <button className="px-4 h-[36px] bg-[#26734D] text-white rounded-[8px] text-[13px] hover:bg-[#1e5a3d]">+ Add Language</button>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 300, minHeight: 200 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-3">Verification</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between"><span>Email</span><span className="text-[#26734D]">Verified</span></div>
              <div className="flex items-center justify-between"><span>Phone</span><span className="text-[#52645A]">Pending</span></div>
              <div className="flex items-center justify-between"><span>Identity</span><span className="text-[#52645A]">Not started</span></div>
            </div>
            <button className="mt-4 px-4 h-[36px] bg-[#26734D] text-white rounded-[8px] text-[13px] hover:bg-[#1e5a3d]">Continue Verification</button>
          </div>

          <div className="bg-white rounded-[12px] border border-[#E2E8E4] p-4" style={{ width: 300, minHeight: 120 }}>
            <h3 className="text-[16px] font-semibold text-[#172B22] mb-2">Help & Guidance</h3>
            <p className="text-[13px] text-[#52645A] mb-3">Need help improving your profile? Learn how to present your skills and experience to potential clients.</p>
            <a href="#" className="text-[#26734D] text-[13px] hover:underline">Visit Help Center</a>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}