"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void; // Optional if read-only
  label?: string;
  readOnly?: boolean;
}

export default function StarRating({
  rating,
  setRating,
  label,
  readOnly = false,
}: StarRatingProps) {
  const [hover, setHover] = useState<number>(0);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => setRating && setRating(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`transition-all duration-200 focus:outline-none ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-slate-200 fill-slate-100"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
