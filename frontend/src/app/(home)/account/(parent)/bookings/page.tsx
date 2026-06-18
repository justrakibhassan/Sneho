"use client";

import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Star,
  Ban,
  MessageCircle,
  ChevronRight,
  Inbox,
  ShieldCheck,
  CreditCard,
  FileText,
  Heart,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import ConfirmActionModal from "@/components/confirm-modal";
import Link from "next/link";
import Image from "next/image";
import ReviewModal from "@/components/review-modal";
import { useRouter } from "next/navigation";
import DailyReportView from "@/components/booking/DailyReportView";
import { Skeleton } from "@/components/ui/skeleton";
import TipModal from "@/components/booking/TipModal";

// --- Interfaces ---
interface IParentBooking {
  id: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  startTime: string;
  endTime: string;
  totalAmount: number;
  review?: {
    id: number;
    rating: number;
  };
  babysitter: {
    userId: number;
    user: {
      id: number;
      name: string;
      profilePicture?: string;
      phoneNumber?: string;
    };
    locationAddress: string;
  };
  tipAmount?: number | string;
}

export default function ParentBookingsPage() {
  const [bookings, setBookings] = useState<IParentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Review Modal State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IParentBooking | null>(
    null
  );

  // Cancel Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    id: null as number | null,
  });

  const [viewingReportId, setViewingReportId] = useState<number | null>(null);

  // Tip Modal State
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [tipBooking, setTipBooking] = useState<IParentBooking | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get("/bookings");
      if (res.data.success) {
        setBookings(res.data.data || res.data.bookings || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelClick = (id: number) => {
    setCancelModal({ isOpen: true, id });
  };

  const handleReviewClick = (booking: IParentBooking) => {
    setSelectedBooking(booking);
    setIsReviewOpen(true);
  };

  const handleTipClick = (booking: IParentBooking) => {
    setTipBooking(booking);
    setIsTipOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelModal.id) return;
    setActionLoading(true);
    try {
      await axiosInstance.patch(`/bookings/${cancelModal.id}`, {
        status: "CANCELLED",
      });
      toast.success("Booking cancelled successfully");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelModal.id ? { ...b, status: "CANCELLED" } : b
        )
      );
      setCancelModal({ isOpen: false, id: null });
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageClick = async (sitterUserId: number) => {
    const toastId = toast.loading("Initializing chat...");
    try {
      const res = await axiosInstance.post("/chat/conversation", {
        targetUserId: sitterUserId, // Corrected parameter name
      });

      if (res.data.success) {
        toast.success("Chat initialized", { id: toastId });
        router.push(`/account/messages?partnerId=${sitterUserId}`);
      }
    } catch (error) {
      console.error("Chat init error", error);
      toast.error("Failed to start chat", { id: toastId });
    }
  };

  // --- Filtering Logic for Tabs ---
  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "PENDING" || b.status === "CONFIRMED"
      ),
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === "COMPLETED"),
    [bookings]
  );

  const historyBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === "CANCELLED" || b.status === "REJECTED"
      ),
    [bookings]
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-10 space-y-2">
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-11 w-32 rounded-2xl" />
          ))}
        </div>

        {/* Bookings Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 rounded-[2.5rem] border border-slate-100 p-8"
            >
              <div className="flex gap-8">
                <Skeleton className="h-20 w-20 rounded-3xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <div className="w-48 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          My Bookings
        </h1>
      </div>

      {viewingReportId ? (
        <DailyReportView
          bookingId={viewingReportId}
          onBack={() => setViewingReportId(null)}
        />
      ) : (
        <Tabs.Root defaultValue="active" className="flex flex-col gap-8">
          <Tabs.List className="flex p-1.5 bg-slate-100/80 rounded-2xl w-full sm:w-fit border border-slate-200 backdrop-blur-sm self-start">
            <Tabs.Trigger
              value="active"
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50"
            >
              Active{" "}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-200 text-[10px] tabular-nums">
                {activeBookings.length}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="completed"
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50"
            >
              Completed{" "}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-200 text-[10px] tabular-nums">
                {completedBookings.length}
              </span>
            </Tabs.Trigger>
            <Tabs.Trigger
              value="history"
              className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50"
            >
              Cancelled
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content
            value="active"
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <BookingList
              bookings={activeBookings}
              onCancel={handleCancelClick}
              onMessage={handleMessageClick}
            />
          </Tabs.Content>

          <Tabs.Content
            value="completed"
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <BookingList
              bookings={completedBookings}
              onRate={handleReviewClick}
              onTip={handleTipClick}
              onViewReport={(id) => setViewingReportId(id)}
              isHistory
            />
          </Tabs.Content>

          <Tabs.Content
            value="history"
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <BookingList bookings={historyBookings} isHistory />
          </Tabs.Content>
        </Tabs.Root>
      )}

      {/* Modals */}
      <ConfirmActionModal
        open={cancelModal.isOpen}
        type="reject"
        titleReject="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmTextReject="Yes, Cancel"
        onClose={() => setCancelModal({ isOpen: false, id: null })}
        onConfirm={confirmCancel}
        loading={actionLoading}
      />

      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={() => {
            fetchBookings();
            setIsReviewOpen(false);
          }}
        />
      )}

      {tipBooking && (
        <TipModal
          bookingId={tipBooking.id}
          sitterName={tipBooking.babysitter.user.name}
          isOpen={isTipOpen}
          onClose={() => setIsTipOpen(false)}
          onSuccess={() => {
            fetchBookings();
            setIsTipOpen(false);
          }}
          currentTip={Number(tipBooking.tipAmount || 0)}
        />
      )}
    </div>
  );
}

// --- Sub-Components ---

function BookingList({
  bookings,
  onCancel,
  onRate,
  onTip,
  onMessage,
  onViewReport,
  isHistory = false,
}: {
  bookings: IParentBooking[];
  onCancel?: (id: number) => void;
  onRate?: (b: IParentBooking) => void;
  onTip?: (b: IParentBooking) => void;
  onMessage?: (id: number) => void;
  onViewReport?: (id: number) => void;
  isHistory?: boolean;
}) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
          <Inbox size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">
          No bookings found
        </h3>
        <p className="text-slate-500 font-medium">
          Any bookings you make will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={onCancel}
          onRate={onRate}
          onTip={onTip}
          onMessage={onMessage}
          onViewReport={onViewReport}
          isHistory={isHistory}
        />
      ))}
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  onRate,
  onTip,
  onMessage,
  onViewReport,
  isHistory,
}: {
  booking: IParentBooking;
  onCancel?: (id: number) => void;
  onRate?: (b: IParentBooking) => void;
  onTip?: (b: IParentBooking) => void;
  onMessage?: (id: number) => void;
  onViewReport?: (id: number) => void;
  isHistory?: boolean;
}) {
  const sitter = booking.babysitter.user;
  const statusColors = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    CONFIRMED: "bg-teal-50 text-teal-600 border-teal-100",
    COMPLETED: "bg-blue-50 text-blue-600 border-blue-100",
    CANCELLED: "bg-red-50 text-red-600 border-red-100",
    REJECTED: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div className="group bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-slate-100 p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-500 relative overflow-hidden">
      {/* Decorative Glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none ${
          booking.status === "CONFIRMED" ? "bg-teal-400" : "bg-slate-400"
        }`}
      />

      {/* Left: Sitter Info */}
      <div className="flex gap-6 flex-1">
        <div className="relative shrink-0">
          <div className="h-20 w-20 rounded-3xl bg-slate-100 overflow-hidden border-2 border-white shadow-xl relative">
            {sitter.profilePicture && sitter.profilePicture.trim() !== "" ? (
              <Image
                src={sitter.profilePicture}
                className="w-full h-full object-cover"
                alt={sitter.name}
                fill
                unoptimized // Use unoptimized if backend serves local files directly
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    sitter.name
                  )}&background=f1f5f9&color=64748b&bold=true`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-slate-300 text-2xl uppercase">
                {sitter.name[0]}
              </div>
            )}
          </div>
          <div className="absolute -bottom-2 -link-2 bg-white p-1.5 rounded-xl shadow-lg border border-slate-50">
            <ShieldCheck
              size={16}
              className="text-teal-500 fill-current bg-white"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">
              {sitter.name}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                statusColors[booking.status]
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Calendar size={16} className="text-teal-500" />
              {new Date(booking.startTime).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Clock size={16} className="text-teal-500" />
              {new Date(booking.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium sm:col-span-2 mt-1">
              <MapPin size={16} className="text-teal-500" />
              <span className="truncate max-w-[200px] md:max-w-none">
                {booking.babysitter.locationAddress}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Pricing & Actions */}
      <div className="flex flex-col md:items-end justify-between md:min-w-[200px] gap-6 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
        <div className="flex md:flex-col items-center md:items-end justify-between w-full">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <CreditCard size={12} /> Total Payment
          </span>
          <div className="text-2xl font-black text-slate-900 tabular-nums">
            TK {booking.totalAmount}
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full justify-end">
          {/* Action: Message */}
          {onMessage && (
            <button
              onClick={() => onMessage(booking.babysitter.userId)}
              className="p-3 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-all border border-slate-100 flex-1 sm:flex-none"
              title="Message Sitter"
            >
              <MessageCircle size={20} />
            </button>
          )}

          {/* Action: Join Call */}
          {booking.status === "CONFIRMED" && (
            <Link
              href={`/meeting/${booking.id}`}
              className="flex items-center justify-center gap-2 bg-linear-to-r from-teal-500 to-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-teal-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all group/btn flex-1"
            >
              <Video
                size={18}
                className="group-hover/btn:scale-110 transition-transform"
              />
              Join Call
            </Link>
          )}

          {/* Action: Pay Now */}
          {booking.status === "CONFIRMED" && (
            <Link
              href={`/payment?bookingId=${booking.id}`}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-slate-200 hover:bg-teal-600 transition-all flex-1"
            >
              <CreditCard size={18} />
              Pay Now
            </Link>
          )}

          {/* Action: View Report */}
          {booking.status === "COMPLETED" && onViewReport && (
            <button
              onClick={() => onViewReport(booking.id)}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-slate-200 hover:bg-black transition-all flex-1"
            >
              <FileText size={18} />
              View Report
            </button>
          )}

          {/* Action: Rate */}
          {booking.status === "COMPLETED" && onRate && (
            <>
              {!booking.review ? (
                <button
                  onClick={() => onRate(booking)}
                  className="flex items-center justify-center gap-2 bg-yellow-400 text-yellow-950 px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-yellow-500/20 hover:bg-yellow-500 transition-all flex-1"
                >
                  <Star size={18} className="fill-current" />
                  Rate
                </button>
              ) : (
                <button
                  onClick={() => onRate(booking)}
                  className="flex items-center justify-center gap-2 bg-teal-50 text-teal-600 px-6 py-3 rounded-2xl text-sm font-black border border-teal-100 hover:bg-teal-100 transition-all flex-1"
                >
                  <Star size={18} className="fill-current" />
                  Edit Review
                </button>
              )}
            </>
          )}

          {/* Action: Tip */}
          {booking.status === "COMPLETED" && onTip && (
            <button
              onClick={() => onTip(booking)}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all flex-1 shadow-lg ${
                Number(booking.tipAmount || 0) > 0
                  ? "bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-rose-200"
                  : "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-200"
              }`}
            >
              <Heart
                size={18}
                className={Number(booking.tipAmount || 0) > 0 ? "fill-current" : ""}
              />
              {Number(booking.tipAmount || 0) > 0
                ? `৳${booking.tipAmount} Tip`
                : "Add Tip"}
            </button>
          )}

          {/* Action: Cancel */}
          {(booking.status === "PENDING" || booking.status === "CONFIRMED") &&
            onCancel && (
              <button
                onClick={() => onCancel(booking.id)}
                className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-slate-100 hover:border-red-100 flex-1 sm:flex-none"
                title="Cancel Booking"
              >
                <Ban size={20} />
              </button>
            )}

          {/* History Link */}
          {isHistory && (
            <Link
              href={`/sitter/${booking.babysitter.userId}`}
              className="p-3 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-all border border-slate-100 flex-1 sm:flex-none"
            >
              <ChevronRight size={20} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
