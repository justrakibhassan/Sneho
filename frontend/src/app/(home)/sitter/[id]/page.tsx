"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MapPin,
  ShieldCheck,
  Calendar,
  MessageCircle,
  CheckCircle,
  Loader2,
  Star,
  Clock,
  Briefcase,
  Heart,
  Award,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { getErrorMessage } from "@/utils/error-handler";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useFavorites } from "@/context/favorites-context";

// --- Types ---
interface ISitterDetails {
  id: number;
  name: string;
  profilePicture: string | null;
  createdAt: string;
  babysitter: {
    id: number;
    locationAddress: string;
    hourlyRate: number;
    experienceYears: number;
    bio: string;
    skills: string | null;
    averageRating: string;
    totalRatings: number;
    isApproved: boolean;
    review: Array<{
      id: number;
      rating: number;
      comment: string;
      createdAt: string;
      user_review_reviewerIdTouser: {
        name: string;
        profilePicture: string | null;
      };
    }>;
  };
}

export default function SitterDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();

  const [sitter, setSitter] = useState<ISitterDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const { favoriteIds, toggleFavorite } = useFavorites();

  // 🕒 Booking State
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");
  const [totalCost, setTotalCost] = useState(0);

  // 1. Fetch Data
  useEffect(() => {
    const fetchSitter = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/sitters/${id}`);
        if (res.data.success) {
          setSitter(res.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSitter();
    }
  }, [id]);

  // Handle local state for UI responsiveness while syncing with global context
  const isFavorited = sitter ? favoriteIds.includes(sitter.babysitter.id) : false;

  // 2. Calculate Cost
  useEffect(() => {
    if (sitter && startTime && endTime) {
      const start = parseInt(startTime.split(":")[0]);
      const end = parseInt(endTime.split(":")[0]);
      let duration = end - start;
      if (duration < 0) duration = 0;
      const rate = Number(sitter.babysitter.hourlyRate);
      setTotalCost(duration * rate);
    }
  }, [startTime, endTime, sitter]);

  // 3. Handle Booking
  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to book a sitter");
      router.push(`/login?redirect=/sitter/${id}`);
      return;
    }

    try {
      const profileCheck = await axiosInstance.get("/user/profile");
      const parentProfile = profileCheck.data.user?.parent;

      if (!parentProfile) {
        toast.error("Please complete your parent profile first");
        router.push(`/account/settings?setup=parent&redirect=/sitter/${id}`);
        return;
      }

      const requiredFields = {
        locationAddress: parentProfile.locationAddress,
        minBudget: parentProfile.minBudget,
        maxBudget: parentProfile.maxBudget,
      };

      const missingFields = Object.values(requiredFields).some(
        (val) => !val || val === 0
      );

      if (missingFields) {
        toast.error("Please complete location and budget in your profile");
        router.push(`/account/settings?setup=parent&redirect=/sitter/${id}`);
        return;
      }

      if (!profileCheck.data.user.phoneNumber) {
        toast.error("Please add your phone number in settings");
        router.push(`/account/settings?setup=parent&redirect=/sitter/${id}`);
        return;
      }
    } catch (error) {
      console.error("Profile check error:", error);
      toast.error("Failed to verify profile");
      return;
    }

    if (!date) return toast.error("Please select a date");
    if (totalCost <= 0) return toast.error("Invalid time range");

    setBookingLoading(true);
    try {
      const payload = {
        babysitterId: sitter?.babysitter.id,
        startTime: new Date(`${date}T${startTime}`).toISOString(),
        endTime: new Date(`${date}T${endTime}`).toISOString(),
        note: "",
      };

      const res = await axiosInstance.post("/bookings", payload);
      if (res.data.success) {
        toast.success("Booking Request Sent! 🎉");
        router.push("/account/bookings");
      }
    } catch (error: unknown) {
      console.error(error);
      const message = getErrorMessage(error, "Booking failed");
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      toast.error("Please login to favorite a sitter");
      return;
    }

    if (currentUser?.role !== "PARENT") {
      toast.error("Only parents can favorite sitters");
      return;
    }

    setFavoriteLoading(true);
    try {
      if (sitter?.babysitter.id) {
        await toggleFavorite(sitter.babysitter.id, e.clientX, e.clientY);
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
      toast.error("Failed to update favorite status");
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 🟢 Loading Skeleton
  if (loading)
    return (
      <main className="min-h-screen bg-slate-50 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Skeleton */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-full" />
                <div className="flex-1 space-y-4 w-full">
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-64" />
                  <div className="flex gap-4 pt-4">
                    <Skeleton className="h-20 w-24 rounded-xl" />
                    <Skeleton className="h-20 w-24 rounded-xl" />
                    <Skeleton className="h-20 w-24 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="bg-white rounded-[2rem] p-8 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 h-96">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );

  if (!sitter) return <div className="pt-32 text-center">Sitter not found</div>;

  const profile = sitter.babysitter;
  const rating = Number(profile.averageRating || 0);

  return (
    <main className="min-h-screen bg-slate-50 pt-28 pb-24 font-sans selection:bg-teal-100 selection:text-teal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* =======================
            LEFT: Sitter Details
           ======================= */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Modern Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-teal-50 to-transparent rounded-full opacity-70 blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Picture */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-teal-400 to-emerald-400 shadow-xl shadow-teal-100">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white border-4 border-white relative">
                    {sitter.profilePicture ? (
                      <Image
                        src={sitter.profilePicture}
                        alt={sitter.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-50 text-4xl font-bold text-teal-300 uppercase">
                        {sitter.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                {profile.isApproved && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute bottom-1 right-2 bg-white text-teal-600 p-1.5 rounded-full shadow-lg border border-teal-50"
                  >
                    <ShieldCheck className="h-6 w-6 fill-teal-50" />
                  </motion.div>
                )}
              </motion.div>

              {/* Info & Stats */}
              <div className="flex-1 w-full pt-2">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                      {sitter.name}
                    </h1>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <MapPin className="h-4 w-4 text-teal-500" />
                      {profile.locationAddress || "Dhaka, Bangladesh"}
                    </div>
                  </div>
                  {/* Action Buttons (Mobile/Top) */}
                  <div className="hidden md:flex gap-3">
                    <button
                      onClick={(e) => handleToggleFavorite(e)}
                      disabled={favoriteLoading}
                      className={`p-3 rounded-full transition-all duration-300 ${
                        isFavorited
                          ? "bg-rose-50 text-rose-500 shadow-lg shadow-rose-100"
                          : "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                      }`}
                      title={
                        isFavorited
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`h-6 w-6 transition-transform ${
                          isFavorited
                            ? "fill-current scale-110"
                            : "group-hover:scale-110"
                        }`}
                      />
                    </button>
                    <button className="p-3 rounded-full bg-slate-50 text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-colors">
                      <Award className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {[
                    {
                      label: "Rating",
                      value: rating || "New",
                      icon: Star,
                      color: "text-amber-500",
                    },
                    {
                      label: "Experience",
                      value: `${profile.experienceYears} Years`,
                      icon: Briefcase,
                      color: "text-blue-500",
                    },
                    {
                      label: "Reviews",
                      value: profile.totalRatings,
                      icon: MessageCircle,
                      color: "text-purple-500",
                    },
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center hover:bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 group/stat"
                    >
                      <div
                        className={`mx-auto w-8 h-8 mb-2 rounded-full bg-white flex items-center justify-center shadow-sm ${stat.color} group-hover/stat:scale-110 transition-transform`}
                      >
                        <stat.icon className="h-4 w-4" fill="currentColor" />
                      </div>
                      <div className="font-bold text-slate-900 text-lg leading-tight">
                        {stat.value}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. Bio & Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                About Me
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
                {profile.bio || "No bio information provided yet."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                Skills & Specialties
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills ? (
                  profile.skills.split(",").map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-teal-50 text-teal-700 font-bold rounded-xl text-xs border border-teal-100 hover:bg-teal-100 transition-colors cursor-default"
                    >
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">
                    No specific skills listed.
                  </span>
                )}
              </div>
            </motion.div>
          </div>

          {/* 3. Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">
                Client Reviews
              </h3>
              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold">
                {profile.review?.length || 0} reviews
              </span>
            </div>

            {profile.review && profile.review.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {profile.review.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-teal-600 font-bold overflow-hidden border border-slate-200">
                          {rev.user_review_reviewerIdTouser.profilePicture ? (
                            <Image
                              src={
                                rev.user_review_reviewerIdTouser.profilePicture
                              }
                              alt={rev.user_review_reviewerIdTouser.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            rev.user_review_reviewerIdTouser.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {rev.user_review_reviewerIdTouser.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <MessageCircle className="text-slate-300" size={32} />
                </div>
                <h4 className="text-slate-900 font-bold mb-1">
                  No reviews yet
                </h4>
                <p className="text-slate-400 text-sm">
                  Be the first to leave a review!
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* =======================
            RIGHT: Booking Panel
           ======================= */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="sticky top-28"
          >
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50">
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
                  Hourly Rate
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-slate-900">
                    ৳{profile.hourlyRate}
                  </span>
                  <span className="text-slate-500 font-medium">/hr</span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-5">
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Select Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm"
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Start
                      </label>
                      <input
                        type="time"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3" /> End
                      </label>
                      <input
                        type="time"
                        className="w-full bg-white border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium shadow-sm"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Panel */}
                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-200">
                  <div className="flex justify-between items-center mb-1 text-teal-100 text-sm font-medium">
                    <span>Estimated Total</span>
                    <span>
                      {totalCost > 0
                        ? `${parseInt(endTime) - parseInt(startTime)} hrs`
                        : "--"}
                    </span>
                  </div>
                  <div className="text-3xl font-black tracking-tight">
                    ৳{totalCost > 0 ? totalCost : "0"}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || totalCost <= 0}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {bookingLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      Book Now{" "}
                      <CheckCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    router.push(`/account/messages?partnerId=${sitter.id}`)
                  }
                  className="w-full py-4 bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" /> Message Sitter
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="h-3 w-3" /> Secure Payment
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
