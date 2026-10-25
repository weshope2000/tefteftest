"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  feedback: string;
  created_at: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/reviews", { params: { reviewee_id: user.user_id } });
        if (mounted) setReviews(res.data);
      } catch {} finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, router]);

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reviews</h1>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Reviewer: {r.reviewer_id}</p>
                    <p className="text-yellow-500 text-lg">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2">{r.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
