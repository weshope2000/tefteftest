"use client";

import { useState } from "react";
import api, { errorMessage } from "@/lib/api";

const reportReasons = [
  { value: "spam", label: "Spam or misleading" },
  { value: "scam", label: "Suspicious or scam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "misleading", label: "Misleading description" },
  { value: "offensive", label: "Offensive or discriminatory" },
  { value: "other", label: "Something else" },
];

export default function JobActions({
  jobId,
  initialSaved = false,
  disabled = false,
  onSavedChange,
}: {
  jobId: string;
  initialSaved?: boolean;
  disabled?: boolean;
  onSavedChange?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [reportState, setReportState] = useState<{ kind: "error" | "success"; message: string } | null>(
    null
  );

  const toggleSave = async () => {
    setSaving(true);
    try {
      if (saved) {
        await api.delete(`/jobs/${jobId}/save`);
      } else {
        await api.post(`/jobs/${jobId}/save`);
      }
      const next = !saved;
      setSaved(next);
      onSavedChange?.(next);
    } catch (err: unknown) {
      setReportState({
        kind: "error",
        message: errorMessage(err, "Could not update your saved jobs."),
      });
    } finally {
      setSaving(false);
    }
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportState(null);
    try {
      await api.post(`/jobs/${jobId}/report`, { reason, details });
      setReportState({ kind: "success", message: "Thanks. Our team will review this listing." });
      setReporting(false);
      setDetails("");
    } catch (err: unknown) {
      setReportState({
        kind: "error",
        message: errorMessage(err, "Could not submit the report."),
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-3">
      <button
        type="button"
        onClick={toggleSave}
        disabled={disabled || saving}
        className={`w-full px-4 py-2 rounded border transition disabled:opacity-50 ${
          saved
            ? "border-green-600 text-green-700 bg-green-50"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        {saved ? "Saved" : "Save job"}
      </button>

      <button
        type="button"
        onClick={() => setReporting((open) => !open)}
        disabled={disabled}
        className="w-full px-4 py-2 rounded text-sm text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
      >
        {reporting ? "Cancel report" : "Report this listing"}
      </button>

      {reporting && (
        <form onSubmit={submitReport} className="pt-3 border-t border-gray-100 space-y-3">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            aria-label="Report reason"
          >
            {reportReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Tell us what is wrong with this listing (optional)"
            className="w-full border rounded px-3 py-2 text-sm h-20"
            maxLength={2000}
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            Submit report
          </button>
        </form>
      )}

      {reportState && (
        <p
          className={`text-xs ${
            reportState.kind === "success" ? "text-green-700" : "text-red-600"
          }`}
        >
          {reportState.message}
        </p>
      )}
    </div>
  );
}
