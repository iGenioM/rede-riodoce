import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Review } from "../types";
import { REVIEWS } from "../mockData";
import { uid } from "../utils";

interface ReviewsState {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "createdAt">) => void;
  addReply: (reviewId: string, text: string) => void;
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: REVIEWS,
      addReview: (review) =>
        set({
          reviews: [
            { ...review, id: uid("rev"), createdAt: new Date().toISOString() },
            ...get().reviews,
          ],
        }),
      addReply: (reviewId, text) =>
        set({
          reviews: get().reviews.map((r) =>
            r.id === reviewId
              ? { ...r, reply: { text, at: new Date().toISOString() } }
              : r
          ),
        }),
    }),
    { name: "ceasa-reviews", storage: createJSONStorage(() => localStorage) }
  )
);

export function producerRatingSummary(reviews: Review[], producerId: string) {
  const list = reviews.filter((r) => r.producerId === producerId);
  const count = list.length;
  const avg = count === 0 ? 0 : list.reduce((s, r) => s + r.rating, 0) / count;
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }));
  return { count, avg, breakdown, list };
}
