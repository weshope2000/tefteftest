"use client";

import { use, useEffect, useRef, useState } from "react";
import { Navbar } from "@/app/components/layout/Navbar";
import BidForm from "@/app/components/bids/BidForm";
import EmployerCard from "@/app/components/jobs/EmployerCard";
import JobActions from "@/app/components/jobs/JobActions";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Bid, Job } from "@/lib/types";

export default function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, displayName } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [myProposal, setMyProposal] = useState<Bid | null>(null);
  const [received, setReceived] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/jobs/${id}`);
        if (!mounted) return;
        setJob(res.data);
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Every freelancer gets their own proposal: a freelancer only ever sees the
  // one they submitted, while the employer who posted the job sees them all.
  useEffect(() => {
    if (!user || !job) return;
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/bids", { params: { job_id: job.id } });
        if (!mounted) return;
        const list: Bid[] = Array.isArray(res.data) ? res.data : [];
        if (user.role === "freelancer") {
          setMyProposal(list.find((b) => b.freelancer_id === user.user_id) ?? null);
        } else if (user.user_id === job.user_id) {
          setReceived(list);
        }
      } catch {
        // proposals are not visible to this account
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user, job]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 px-8 py-12">
          <p className="text-gray-500">Loading job...</p>
        </div>
      </>
    );
  }

  if (notFound || !job) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 px-8 py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <p className="text-gray-600">This listing may have been removed or closed.</p>
        </div>
      </>
    );
  }

  const skills = job.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const isOwner = user?.user_id === job.user_id;
  const isFreelancer = user?.role === "freelancer";
  const isHourly = job.type === "hourly";
  const deliveryLabel = isHourly ? "Expected duration" : "Expected delivery";
  const showProposals = !!user && (isFreelancer || isOwner);

  const priceOf = (bid: Bid) =>
    bid.rate_type === "hourly" ? `$${bid.hourly_rate}/hr` : `$${bid.amount.toLocaleString()}`;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Posted on {new Date(job.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium capitalize">
              {job.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About this job</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {job.description || "No description was provided for this job."}
                </p>
              </section>

              {job.requirements && (
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                  <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                </section>
              )}

              {skills.length > 0 && (
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Required skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {showProposals && (
                <section className="bg-white p-6 rounded-lg shadow-md" ref={proposalRef}>
                  {isFreelancer ? (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        {myProposal ? "Your proposal" : "Submit a proposal"}
                      </h2>
                      <p className="text-sm text-gray-500 mb-5">
                        Proposing as <span className="font-medium text-gray-700">{displayName}</span>.
                        {myProposal
                          ? " You can edit or withdraw it while the job stays open."
                          : " Introduce yourself, price the work and set an expected delivery time."}
                      </p>

                      {isOwner ? (
                        <p className="text-sm text-gray-500">
                          This is your own listing, so you cannot submit a proposal on it.
                        </p>
                      ) : job.status !== "open" ? (
                        <p className="text-sm text-gray-500">
                          This job is {job.status} and is no longer accepting proposals.
                        </p>
                      ) : (
                        <BidForm
                          jobId={job.id}
                          jobType={job.type}
                          jobBudget={job.budget}
                          existingBid={myProposal}
                          onProposalChange={setMyProposal}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Proposals received
                      </h2>
                      <p className="text-sm text-gray-500 mb-5">
                        {received.length === 0
                          ? "No freelancer has proposed on this job yet."
                          : `${received.length} freelancer${received.length === 1 ? " has" : "s have"} proposed on this job.`}
                      </p>

                      <div className="space-y-4">
                        {received.map((bid) => (
                          <div key={bid.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                                  {(bid.freelancer_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {bid.freelancer_name || "Freelancer"}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">{bid.status}</p>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <p className="font-semibold text-gray-900">{priceOf(bid)}</p>
                                <p className="text-gray-500">{bid.delivery_days} days</p>
                              </div>
                            </div>

                            {bid.cover_letter && (
                              <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">
                                {bid.cover_letter}
                              </p>
                            )}
                            {bid.experience && (
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium text-gray-700">Experience:</span>{" "}
                                {bid.experience}
                              </p>
                            )}
                            {bid.portfolio?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {bid.portfolio.map((link) => (
                                  <a
                                    key={link}
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-green-700 hover:underline"
                                  >
                                    {link}
                                  </a>
                                ))}
                              </div>
                            )}
                            {bid.milestones?.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">Milestones</p>
                                <ul className="mt-1 space-y-1">
                                  {bid.milestones.map((milestone, index) => (
                                    <li key={index} className="text-sm text-gray-600">
                                      {milestone.title} — ${milestone.amount.toLocaleString()}{" "}
                                      in {milestone.due_in_days} days
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-900 mb-4">Job summary</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Budget</dt>
                    <dd className="text-gray-900 font-medium">
                      ${job.budget.toLocaleString()}
                      {isHourly ? " / hr" : ""}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">{deliveryLabel}</dt>
                    <dd className="text-gray-900 font-medium">
                      {job.delivery_days > 0 ? `${job.delivery_days} days` : "To be agreed"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Project type</dt>
                    <dd className="text-gray-900 font-medium capitalize">{job.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Proposals</dt>
                    <dd className="text-gray-900 font-medium">
                      {job.proposals_disclosed ? job.proposal_count : "Not disclosed"}
                    </dd>
                  </div>
                </dl>
              </div>

              <EmployerCard employer={job.employer} />

              {isFreelancer && job.status === "open" && !isOwner && (
                <button
                  type="button"
                  onClick={() =>
                    proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  {myProposal ? "Review your proposal" : "Submit a Proposal"}
                </button>
              )}

              {isOwner && received.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    proposalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  View proposals ({received.length})
                </button>
              )}

              <JobActions
                jobId={job.id}
                initialSaved={job.is_saved}
                disabled={!user || isOwner}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
