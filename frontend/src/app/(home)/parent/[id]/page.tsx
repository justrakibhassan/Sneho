"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  MessageCircle,
  Baby,
  Heart,
  TrendingUp,
  Clock,
  ChevronLeft,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";

// --- Types ---
interface IParentDetails {
  id: number;
  name: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
  parent: {
    id: number;
    locationAddress: string | null;
    situation: string | null;
    requiredDays: string | null;
    child: Array<{
      id: number;
      name: string;
      age: number;
      gender: string;
      specialNeeds: string | null;
      energyLevel: number;
    }>;
  };
}

export default function ParentProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [profile, setProfile] = useState<IParentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(`/api/parents/${id}`);
        if (response.data.success) {
          setProfile(response.data.data);
        }
      } catch (error: unknown) {
        console.error("Fetch Parent Error:", error);
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  const handleMessageClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to message parents");
      router.push("/login?redirect=/parent/" + id);
      return;
    }

    if (currentUser?.id === Number(id)) {
      toast.error("You cannot message yourself");
      return;
    }

    try {
      // API call to get or create conversation
      const response = await axiosInstance.post("/api/chat/conversation", {
        partnerId: Number(id),
      });

      if (response.data.success) {
        // Redirect to messages page with this partner
        router.push(`/account/messages?partnerId=${id}`);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error("Failed to start conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <h2 className="text-2xl font-bold text-slate-800">Profile Not Found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 text-teal-600 font-bold"
        >
          <ChevronLeft size={20} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header / Cover Area */}
      <div className="relative h-64 bg-linear-to-r from-teal-500 to-emerald-600">
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all border border-white/20 shadow-xl"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="max-w-6xl mx-auto px-6 h-full flex items-end">
          <div className="flex flex-col md:flex-row gap-6 md:items-end translate-y-20 w-full">
            {/* Avatar Section */}
            <div className="relative w-40 h-40 rounded-[2.5rem] bg-white p-2 shadow-2xl shadow-teal-900/10">
              <div className="w-full h-full rounded-[2rem] overflow-hidden bg-teal-50 flex items-center justify-center text-5xl font-black text-teal-600 border border-teal-100">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.name}
                    width={160}
                    height={160}
                    className="object-cover"
                  />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white text-teal-600 p-2.5 rounded-2xl shadow-lg border border-teal-50">
                <ShieldCheck
                  size={20}
                  className="fill-current bg-white rounded-full"
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-teal-100">
                  Parent
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-slate-500 font-medium text-sm">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-teal-500" />
                  {profile.parent.locationAddress || "Location Unknown"}
                </span>
                <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                  <Calendar size={16} className="text-teal-500" />
                  Member since {new Date(profile.createdAt).getFullYear()}
                </span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pb-4">
              <button
                onClick={handleMessageClick}
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-slate-900/20 hover:bg-teal-600 transition-all hover:-translate-y-1 active:scale-95"
              >
                <MessageCircle size={20} />
                Message Parent
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-32 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Situation Section */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="text-pink-500 fill-pink-50" size={20} />
              About Our Family
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm italic">
              {profile.parent.situation
                ? `"${profile.parent.situation}"`
                : "This parent hasn't added a family description yet."}
            </p>
          </div>

          {/* Children Section */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Baby className="text-teal-600" size={24} />
              Our Little Ones
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.parent.child.length > 0 ? (
                profile.parent.child.map((child) => (
                  <div
                    key={child.id}
                    className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-teal-100 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-teal-600 shadow-sm border border-slate-50">
                        <Baby size={24} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-white rounded-lg border border-slate-50">
                        {child.gender}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-teal-600 transition-colors">
                      {child.name}
                    </h4>
                    <div className="flex gap-4">
                      <span className="text-sm text-slate-500 font-medium">
                        {child.age} Years Old
                      </span>
                      {child.specialNeeds && (
                        <span className="text-sm text-pink-600 font-bold">
                          Special Needs
                        </span>
                      )}
                    </div>

                    {/* Energy Meter */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Energy Level
                        </span>
                        <span className="text-xs font-bold text-teal-600">
                          {child.energyLevel}/10
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                          style={{ width: `${child.energyLevel * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-slate-400">
                  <p>No child information shared yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-teal-900/5">
            <h3 className="text-lg font-bold text-slate-800 mb-6">
              Requirement Details
            </h3>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Status
                  </h4>
                  <p className="font-bold text-slate-800 text-sm">
                    Searching for Sitter
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Needed Days
                  </h4>
                  <p className="font-bold text-slate-800 text-sm">
                    {profile.parent.requiredDays || "Flexible / Not set"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Email
                  </h4>
                  <p className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Identity verified by Sneho
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
