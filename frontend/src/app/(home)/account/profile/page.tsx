"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import {
  MapPin,
  Mail,
  Edit3,
  ShieldCheck,
  Loader2,
  Check,
  User,
  Star,
  Wallet,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error-handler";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface IAvailability {
  dayOfWeek: string;
  isAvailable: boolean;
}

interface IParentProfile {
  id: number;
  locationAddress?: string;
  situation?: string;
  minBudget?: number;
  maxBudget?: number;
  requiredDays?: string;
}

interface IBabysitterProfile {
  id: number;
  locationAddress?: string;
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
  averageRating?: number;
  totalRatings?: number;
  dob?: string;
  gender?: string;
  skills?: string;
  availability?: IAvailability[];
}

interface IUserProfile {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: "PARENT" | "BABYSITTER" | "ADMIN" | "USER";
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePicture?: string;
  parent?: IParentProfile;
  babysitter?: IBabysitterProfile;
}

export default function ProfilePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get("/user/profile");
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching profile", error);
      toast.error(getErrorMessage(error, "Failed to load profile"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else if (!loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5F3F7] pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-10 w-64" />

          {/* Main Card Skeleton */}
          <div className="bg-white rounded-[1.5rem] border border-white p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column */}
              <div className="lg:col-span-4 text-center">
                <Skeleton className="h-40 w-40 rounded-3xl mx-auto mb-6" />
                <Skeleton className="h-8 w-48 mx-auto mb-2" />
                <Skeleton className="h-5 w-32 mx-auto mb-6" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-2xl">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const isSitter = profile.role === "BABYSITTER";
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#E5F3F7] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        <h1 className="text-4xl font-black text-[#1E293B] mb-2 px-2">
          My Profile
        </h1>

        {/* Main Card */}
        <div className="bg-white rounded-[1.5rem] shadow-sm overflow-hidden border border-white">
          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column: Avatar & Mini Info */}
              <div className="lg:col-span-3 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#E5F3F7] shadow-xl relative z-10">
                    {profile.profilePicture ? (
                      <Image
                        src={profile.profilePicture}
                        alt={profile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-5xl font-black text-slate-300">
                        {profile.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Subtle decorative ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 scale-110 z-0 group-hover:scale-125 transition-transform duration-700" />
                </div>

                <div className="mt-8 text-center space-y-2">
                  <h2 className="text-2xl font-black text-[#1E293B]">
                    {profile.name}
                  </h2>
                  <div className="flex items-center justify-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4" />
                    {isSitter ? "Verified Babysitter" : "Verified Parent"}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Info */}
              <div className="lg:col-span-9 space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-3xl font-black text-[#1E293B]">
                      {profile.name}
                    </h2>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      <Check className="w-3.5 h-3.5" />
                      {isSitter ? "Verified Babysitter" : "Verified Parent"}
                    </div>
                  </div>
                  <p className="text-slate-400 font-bold text-sm">
                    Member since: {memberSince}
                  </p>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Email
                      </p>
                      <p className="font-bold text-[#1E293B]">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Location
                      </p>
                      <p className="font-bold text-[#1E293B]">
                        {isSitter
                          ? profile.babysitter?.locationAddress
                          : profile.parent?.locationAddress || "Not set"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100 w-full" />

                <div className="space-y-3">
                  <p className="text-sm font-black text-[#1E293B]">
                    Bio:{" "}
                    <span className="text-slate-500 font-medium ml-1">
                      {isSitter
                        ? profile.babysitter?.bio
                        : profile.parent?.situation ||
                          "No description added yet."}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Grid: Availability & Reviews */}
            {isSitter && (
              <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Availability Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-100" />
                    <h3 className="text-xl font-black text-[#1E293B] px-4">
                      My Availability
                    </h3>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[320px]">
                      {["M", "M", "T", "W", "M", "T", "F", "S", "S"].map(
                        (day, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-4"
                          >
                            <span className="text-slate-400 font-black text-xs">
                              {day}
                            </span>
                            <div
                              className={`w-10 h-3 rounded-full ${
                                i < 6 ? "bg-[#10B981]" : "bg-slate-200"
                              }`}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-[#1E293B] pr-4">
                      Reviews
                    </h3>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <RecentReviews sitterId={profile.id} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 px-2">
          <Link
            href="/account/settings"
            className="flex items-center gap-3 px-8 py-4 bg-[#4B9AA4] hover:bg-[#3d7d85] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#4B9AA4]/20 active:scale-95"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </Link>
          <Link
            href="/account/payments"
            className="flex items-center gap-3 px-8 py-4 bg-[#4B9AA4] hover:bg-[#3d7d85] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#4B9AA4]/20 active:scale-95"
          >
            <Wallet className="w-4 h-4" /> Payment Settings
          </Link>
          <Link
            href="/account/settings?tab=account"
            className="flex items-center gap-3 px-8 py-4 bg-[#4B9AA4] hover:bg-[#3d7d85] text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#4B9AA4]/20 active:scale-95"
          >
            <Settings className="w-4 h-4" /> Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Sub-component for Reviews ---
interface IReview {
  id: number;
  rating: number;
  comment: string;
  user_review_reviewerIdTouser?: {
    name: string;
    profilePicture?: string | null;
  };
}

function RecentReviews({ sitterId }: { sitterId: number }) {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axiosInstance.get(`/reviews/sitter/${sitterId}`);
        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error("Reviews fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [sitterId]);

  if (loading)
    return (
      <div className="text-slate-400 font-bold p-4">Loading reviews...</div>
    );
  if (reviews.length === 0)
    return <div className="text-slate-400 italic p-4">No reviews yet.</div>;

  const review = reviews[0]; // Show the most recent one to match the ref image style

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-50 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 relative">
            {review.user_review_reviewerIdTouser?.profilePicture ? (
              <Image
                src={review.user_review_reviewerIdTouser.profilePicture}
                alt="Reviewer"
                fill
                className="object-cover"
              />
            ) : (
              <User className="absolute inset-0 m-auto w-6 h-6 text-slate-300" />
            )}
          </div>
          <div>
            <h4 className="font-black text-[#1E293B]">
              {review.user_review_reviewerIdTouser?.name || "Sarah D."}
            </h4>
            <div className="flex items-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating
                      ? "fill-[#F97316] text-[#F97316]"
                      : "text-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "fill-[#F97316] text-[#F97316]"
                  : "text-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-slate-500 font-medium text-sm leading-relaxed italic">
        &quot;{review.comment}&quot;
      </p>
    </div>
  );
}
