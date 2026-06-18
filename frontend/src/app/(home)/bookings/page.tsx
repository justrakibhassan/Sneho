"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { Video, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReviewModal from "@/components/review-modal";

// Interfaces
interface IUser {
  id: number;
  name: string;
  email: string;
}
interface IParty {
  userId: number;
  locationAddress: string;
  user: IUser;
}
interface IBooking {
  id: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  startTime: string;
  endTime: string;
  totalAmount: number;
  babysitter?: IParty;
  parent?: IParty;
}

export default function BookingsPage() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("UPCOMING");

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axiosInstance.get("/bookings/my-bookings");
      if (res.data.success) setBookings(res.data.bookings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  // Filter Logic
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "UPCOMING")
      return booking.status === "CONFIRMED" || booking.status === "PENDING";
    if (activeTab === "COMPLETED") return booking.status === "COMPLETED";
    if (activeTab === "CANCELLED") return booking.status === "CANCELLED";
    return true;
  });

  const handleReviewClick = (booking: IBooking) => {
    setSelectedBooking(booking);
    setIsReviewOpen(true);
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto" /> Loading...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-slate-500 text-sm">Manage schedules & history</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {["UPCOMING", "COMPLETED", "CANCELLED", "ALL"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <p className="text-center py-10 text-slate-400">
            No bookings found in {activeTab}
          </p>
        ) : (
          filteredBookings.map((booking) => {
            const otherParty =
              user?.role === "PARENT" ? booking.babysitter : booking.parent;
            const name = otherParty?.user.name || "User";
            const date = new Date(booking.startTime).toLocaleDateString();
            const time = new Date(booking.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border p-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xl text-slate-400">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold">
                      {booking.status}
                    </span>
                    <div className="text-sm text-slate-500 mt-1 flex gap-3">
                      <span>📅 {date}</span>
                      <span>⏰ {time}</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Total
                    </span>
                    <p className="font-bold text-lg">
                      ৳{booking.totalAmount || 0}
                    </p>
                  </div>

                  {/* THIS IS THE VIDEO CALL BUTTON */}
                  {booking.status === "CONFIRMED" && (
                    <Link
                      href={`/meeting/${booking.id}`}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
                    >
                      <Video className="h-4 w-4" /> Join Video Call
                    </Link>
                  )}

                  {booking.status === "COMPLETED" &&
                    user?.role === "PARENT" && (
                      <button
                        onClick={() => handleReviewClick(booking)}
                        className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        <Star className="h-4 w-4" /> Rate Sitter
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedBooking && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          booking={selectedBooking}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
}
