"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, X } from "lucide-react";
import StarRating from "./star-rating"; 
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/error-handler";

// ✅ Type Definitions
interface IBooking {
  id: number;
  babysitter?: {
    userId: number;
    user: {
      name: string;
    };
  };
}

interface ReviewModalProps {
  booking: IBooking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({
  booking,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [loading, setLoading] = useState<boolean>(false);

  // Rating States
  const [rating, setRating] = useState<number>(5); // Overall
  const [punctuality, setPunctuality] = useState<number>(5);
  const [professionalism, setProfessionalism] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!booking.babysitter?.userId) {
      toast.error("Babysitter information missing.");
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post("/reviews", {
        bookingId: booking.id,
        revieweeId: booking.babysitter.userId,
        rating,
        comment,
        punctuality,
        professionalism,
        communication,
      });

      toast.success("Review submitted successfully!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      const msg = getErrorMessage(error, "Failed to submit review");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Modal Content */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 m-4">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Rate Experience
            </h3>
            <p className="text-xs text-slate-500">
              Booking #{booking.id} with {booking.babysitter?.user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Overall Rating */}
          <div className="text-center bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100">
            <StarRating
              label="Overall Experience"
              rating={rating}
              setRating={setRating}
            />
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Tap stars to rate
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <StarRating
              label="Punctuality"
              rating={punctuality}
              setRating={setPunctuality}
            />
            <StarRating
              label="Professionalism"
              rating={professionalism}
              setRating={setProfessionalism}
            />
            <div className="col-span-2 flex justify-center">
              <StarRating
                label="Communication"
                rating={communication}
                setRating={setCommunication}
              />
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Write a Review
            </label>
            <textarea
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
              placeholder="Tell us what you liked about the service..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 hover:bg-teal-600 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
