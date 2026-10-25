"use client";

import { useState } from "react";
import api, { errorMessage } from "@/lib/api";
import { Bid, Milestone } from "@/lib/types";

interface BidFormProps {
  jobId: string;
  jobType: string;
  jobBudget: number;
  existingBid: Bid | null;
  onProposalChange: (bid: Bid | null) => void;
}

interface FormState {
  rateType: string;
  amount: string;
  hourlyRate: string;
  deliveryDays: string;
  coverLetter: string;
  experience: string;
  portfolio: string[];
  milestones: Milestone[];
}

const emptyMilestone: Milestone = {
  title: "",
  description: "",
  amount: 0,
  due_in_days: 0,
};

function toFormState(bid: Bid | null, jobType: string): FormState {
  if (!bid) {
    return {
      rateType: jobType === "hourly" ? "hourly" : "fixed",
      amount: "",
      hourlyRate: "",
      deliveryDays: "",
      coverLetter: "",
      experience: "",
      portfolio: [],
      milestones: [],
    };
  }
  return {
    rateType: bid.rate_type || (bid.amount > 0 ? "fixed" : "hourly"),
    amount: bid.amount ? String(bid.amount) : "",
    hourlyRate: bid.hourly_rate ? String(bid.hourly_rate) : "",
    deliveryDays: bid.delivery_days ? String(bid.delivery_days) : "",
    coverLetter: bid.cover_letter || "",
    experience: bid.experience || "",
    portfolio: bid.portfolio?.length ? [...bid.portfolio] : [],
    milestones: bid.milestones?.length ? bid.milestones.map((m) => ({ ...m })) : [],
  };
}

export default function BidForm({
  jobId,
  jobType,
  jobBudget,
  existingBid,
  onProposalChange,
}: BidFormProps) {
  const isEditing = !!existingBid && existingBid.status === "pending";
  const [form, setForm] = useState<FormState>(() => toFormState(existingBid, jobType));
  const [submitting, setSubmitting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isFixed = form.rateType === "fixed";
  const showMilestones = jobType === "fixed" && isFixed;
  const milestoneTotal = form.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));

  const buildPayload = () => ({
    job_id: jobId,
    rate_type: form.rateType,
    amount: form.rateType === "fixed" ? Number(form.amount) || 0 : 0,
    hourly_rate: form.rateType === "hourly" ? Number(form.hourlyRate) || 0 : 0,
    delivery_days: Number(form.deliveryDays) || 0,
    cover_letter: form.coverLetter.trim(),
    experience: form.experience.trim(),
    portfolio: form.portfolio.map((p) => p.trim()).filter(Boolean),
    milestones: form.milestones
      .filter((m) => m.title.trim())
      .map((m) => ({
        title: m.title.trim(),
        description: m.description.trim(),
        amount: Number(m.amount) || 0,
        due_in_days: Number(m.due_in_days) || 0,
      })),
  });

  const validate = (): string | null => {
    if (!form.coverLetter.trim()) return "A cover letter is required.";
    if (form.rateType === "fixed" && (!form.amount || Number(form.amount) <= 0)) {
      return "Enter a proposed price greater than 0.";
    }
    if (form.rateType === "hourly" && (!form.hourlyRate || Number(form.hourlyRate) <= 0)) {
      return "Enter an hourly rate greater than 0.";
    }
    if (!form.deliveryDays || Number(form.deliveryDays) <= 0) {
      return "Enter the estimated delivery time in days.";
    }
    for (const link of form.portfolio) {
      const trimmed = link.trim();
      if (trimmed && !/^https?:\/\//i.test(trimmed)) {
        return "Portfolio links must start with http:// or https://";
      }
    }
    for (const milestone of form.milestones) {
      if (milestone.title.trim() && (!Number(milestone.amount) || Number(milestone.amount) <= 0)) {
        return "Every milestone needs an amount greater than 0.";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = isEditing
        ? await api.put(`/bids/${existingBid.id}`, payload)
        : await api.post("/bids", payload);
      onProposalChange(res.data);
      setNotice(isEditing ? "Your proposal has been updated." : "Your proposal has been submitted.");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not submit your proposal."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!existingBid) return;
    setError(null);
    setNotice(null);
    setWithdrawing(true);
    try {
      await api.put(`/bids/${existingBid.id}/withdraw`);
      onProposalChange({ ...existingBid, status: "withdrawn" });
      setNotice("Your proposal has been withdrawn.");
    } catch (err: unknown) {
      setError(errorMessage(err, "Could not withdraw your proposal."));
    } finally {
      setWithdrawing(false);
    }
  };

  const addPortfolioLink = () => update({ portfolio: [...form.portfolio, ""] });
  const setPortfolioLink = (index: number, value: string) => {
    const portfolio = [...form.portfolio];
    portfolio[index] = value;
    update({ portfolio });
  };
  const removePortfolioLink = (index: number) => {
    const portfolio = [...form.portfolio];
    portfolio.splice(index, 1);
    update({ portfolio });
  };

  const addMilestone = () => update({ milestones: [...form.milestones, { ...emptyMilestone }] });
  const setMilestone = (index: number, patch: Partial<Milestone>) => {
    const milestones = [...form.milestones];
    milestones[index] = { ...milestones[index], ...patch };
    update({ milestones });
  };
  const removeMilestone = (index: number) => {
    const milestones = [...form.milestones];
    milestones.splice(index, 1);
    update({ milestones });
  };

  const withdrawn = existingBid?.status === "withdrawn";
  const decided = existingBid && existingBid.status !== "pending" && !withdrawn;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-2 rounded">{error}</div>
      )}
      {notice && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded">{notice}</div>
      )}

      {withdrawn && (
        <p className="text-sm text-gray-500">
          You withdrew your proposal on this job. You can submit a new one below.
        </p>
      )}
      {decided && (
        <p className="text-sm text-gray-500">
          This proposal was {existingBid?.status} and can no longer be changed.
        </p>
      )}

      <div>
        <label htmlFor="rate-type" className="block text-sm font-medium text-gray-700 mb-1">
          Pricing
        </label>
        <select
          id="rate-type"
          value={form.rateType}
          onChange={(e) => update({ rateType: e.target.value })}
          className="w-full border rounded px-4 py-2"
        >
          <option value="fixed">Fixed price</option>
          <option value="hourly">Hourly rate</option>
        </select>
        {jobBudget > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            {jobType === "hourly" ? "Job budget" : "Job budget"}: ${jobBudget.toLocaleString()}
            {jobType === "hourly" ? " per hour" : ""}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isFixed ? (
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Proposed price ($)
            </label>
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => update({ amount: e.target.value })}
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>
        ) : (
          <div>
            <label htmlFor="hourly-rate" className="block text-sm font-medium text-gray-700 mb-1">
              Hourly rate ($/hr)
            </label>
            <input
              id="hourly-rate"
              type="number"
              min="1"
              step="0.01"
              value={form.hourlyRate}
              onChange={(e) => update({ hourlyRate: e.target.value })}
              className="w-full border rounded px-4 py-2"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="delivery-days" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated delivery (days)
          </label>
          <input
            id="delivery-days"
            type="number"
            min="1"
            value={form.deliveryDays}
            onChange={(e) => update({ deliveryDays: e.target.value })}
            className="w-full border rounded px-4 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="cover-letter" className="block text-sm font-medium text-gray-700 mb-1">
          Cover letter
        </label>
        <textarea
          id="cover-letter"
          value={form.coverLetter}
          onChange={(e) => update({ coverLetter: e.target.value })}
          placeholder="Tell the employer how you would approach this project"
          className="w-full border rounded px-4 py-2 h-32"
          maxLength={5000}
          required
        />
      </div>

      <div>
        <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
          Relevant experience
        </label>
        <textarea
          id="experience"
          value={form.experience}
          onChange={(e) => update({ experience: e.target.value })}
          placeholder="Describe the projects and skills that make you a good fit"
          className="w-full border rounded px-4 py-2 h-28"
          maxLength={5000}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Portfolio samples</label>
          <button
            type="button"
            onClick={addPortfolioLink}
            className="text-sm text-green-700 hover:underline"
          >
            Add link
          </button>
        </div>
        {form.portfolio.length === 0 ? (
          <p className="text-sm text-gray-500">Add links to your work, for example a live site or repository.</p>
        ) : (
          <div className="space-y-2">
            {form.portfolio.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setPortfolioLink(index, e.target.value)}
                  placeholder="https://"
                  className="flex-1 border rounded px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioLink(index)}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showMilestones && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Milestones (optional)</label>
            <button
              type="button"
              onClick={addMilestone}
              className="text-sm text-green-700 hover:underline"
            >
              Add milestone
            </button>
          </div>
          {form.milestones.length === 0 ? (
            <p className="text-sm text-gray-500">
              Break the project into milestones to show how the work is delivered.
            </p>
          ) : (
            <div className="space-y-3">
              {form.milestones.map((milestone, index) => (
                <div key={index} className="border rounded p-3 space-y-2">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => setMilestone(index, { title: e.target.value })}
                    placeholder="Milestone title"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <textarea
                    value={milestone.description}
                    onChange={(e) => setMilestone(index, { description: e.target.value })}
                    placeholder="What is delivered in this milestone"
                    className="w-full border rounded px-3 py-2 text-sm h-16"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={milestone.amount || ""}
                      onChange={(e) =>
                        setMilestone(index, { amount: Number(e.target.value) || 0 })
                      }
                      placeholder="Amount ($)"
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      value={milestone.due_in_days || ""}
                      onChange={(e) =>
                        setMilestone(index, { due_in_days: Number(e.target.value) || 0 })
                      }
                      placeholder="Due in (days)"
                      className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-500">
                Milestones total ${milestoneTotal.toLocaleString()}
                {Number(form.amount) > 0 && ` of $${Number(form.amount).toLocaleString()}`}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={submitting || withdrawn}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEditing ? "Save changes" : "Submit proposal"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50"
          >
            {withdrawing ? "Withdrawing..." : "Withdraw proposal"}
          </button>
        )}
      </div>
    </form>
  );
}
