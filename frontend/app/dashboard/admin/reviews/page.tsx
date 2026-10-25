"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/app/components/layout/AdminLayout";
import api from "@/lib/api";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Review service requires reviewee_id param; skip for admin overview
    setLoading(false);
  }, []);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Reviews & Moderation</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {loading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Rating</th>
                  <th className="text-left px-4 py-3">Comment</th>
                  <th className="text-left px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">{r.rating}/5</td>
                    <td className="px-4 py-3">{r.comment}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}