"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import {
  Calendar,
  ShieldCheck,
  Mail,
  MapPin,
  Phone,
  Star,
  Clock,
  CreditCard,
  TrendingUp,
  Activity,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Baby,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces
interface IUser {
  id: number;
  email: string;
  name?: string;
  role: "ADMIN" | "PARENT" | "BABYSITTER";
  phoneNumber?: string;
  isApproved: boolean;
  createdAt: string;
  profilePicture?: string;
}

interface IActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  status?: string;
}

export default function AccountOverviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [stats, setStats] = useState({
    bookingsCount: 0,
    rating: 0,
    balance: 0,
    sessionsCount: 0,
  });
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        router.push("/login");
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Fetch real stats
        const statsResponse = await axiosInstance.get("/user/dashboard-stats");
        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }

        // Fetch recent activity
        try {
          const activityResponse = await axiosInstance.get(
            "/user/recent-activity"
          );
          if (activityResponse.data.success) {
            setActivities(activityResponse.data.activities.slice(0, 5));
          }
        } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "booking":
        return <Calendar className="h-5 w-5" />;
      case "payment":
        return <DollarSign className="h-5 w-5" />;
      case "session":
        return <Baby className="h-5 w-5" />;
      case "review":
        return <Star className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "booking":
        return "bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-700";
      case "payment":
        return "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700";
      case "session":
        return "bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700";
      case "review":
        return "bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-700";
      default:
        return "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        {/* Header Skeleton */}
        <div className="bg-linear-to-br from-teal-500 via-teal-600 to-purple-600 rounded-3xl p-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 bg-white/20" />
              <Skeleton className="h-5 w-96 bg-white/20" />
            </div>
            <Skeleton className="h-20 w-20 rounded-2xl bg-white/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/80 p-6 rounded-3xl border-2 border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Skeleton */}
            <div className="bg-white/80 rounded-3xl border-2 border-slate-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-64" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 rounded-3xl p-8 border-2 border-slate-100 text-center">
              <Skeleton className="h-28 w-28 rounded-3xl mx-auto mb-4" />
              <Skeleton className="h-7 w-40 mx-auto mb-2" />
              <Skeleton className="h-4 w-24 mx-auto mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-10">
      {/* Background Orbs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-linear-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-linear-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-linear-to-br from-teal-500 via-teal-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl shadow-teal-200/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              Hello, {user?.name?.split(" ")[0]}!
              <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
            </h1>
            <p className="text-teal-50 text-lg">
              Here&apos;s what&apos;s happening with your account today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Stats & Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bookings Card */}
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-teal-50/50 to-cyan-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-linear-to-br from-teal-500 to-cyan-500 rounded-2xl shadow-lg shadow-teal-200">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">
                    {stats.bookingsCount}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Bookings
                  </p>
                </div>
              </div>
            </div>

            {/* Rating/Sessions Card */}
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-orange-50/50 to-yellow-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-linear-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg shadow-orange-200">
                  <Star className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">
                    {user?.role === "BABYSITTER"
                      ? stats.rating.toFixed(1)
                      : stats.sessionsCount}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {user?.role === "BABYSITTER" ? "Rating" : "Sessions"}
                  </p>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-2 border-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center gap-4">
                <div className="p-4 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-200">
                  <CreditCard className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">
                    ৳{stats.balance.toFixed(0)}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {user?.role === "BABYSITTER" ? "Earned" : "Spent"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-slate-100 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-teal-50/30 via-transparent to-purple-50/30 -z-10"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-2xl text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-linear-to-br from-teal-500 to-purple-500 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Recent Activity
              </h3>
              {activities.length > 0 && (
                <span className="px-4 py-2 bg-linear-to-r from-teal-100 to-purple-100 rounded-full text-sm font-bold text-teal-700">
                  {activities.length} Recent
                </span>
              )}
            </div>

            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block p-6 bg-slate-50 rounded-3xl mb-4">
                    <Activity className="h-12 w-12 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No recent activity yet
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Your bookings and sessions will appear here
                  </p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="group flex gap-4 p-4 rounded-2xl hover:bg-linear-to-r hover:from-teal-50 hover:to-purple-50 transition-all duration-200 border-2 border-transparent hover:border-slate-100 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`p-3 rounded-xl h-fit shadow-sm ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">
                        {activity.type}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.status && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${
                              activity.status === "COMPLETED"
                                ? "bg-green-100 text-green-700"
                                : activity.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {activity.status === "COMPLETED" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {activity.status}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-slate-100 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-teal-50/50 via-transparent to-purple-50/50 -z-10"></div>

            <div className="relative z-10">
              {/* Avatar */}
              <div className="inline-block relative mb-4">
                <div className="h-28 w-28 rounded-3xl bg-linear-to-br from-teal-400 to-purple-500 mx-auto flex items-center justify-center shadow-2xl shadow-teal-200/50 border-4 border-white">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-4xl font-black text-white">
                      {user?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                {user?.isApproved && (
                  <div className="absolute -bottom-1 -right-1 bg-linear-to-br from-green-400 to-emerald-500 p-2 rounded-2xl border-4 border-white shadow-lg">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-black bg-linear-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-1">
                {user?.name}
              </h2>
              <p className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider">
                {user?.role}
              </p>

              <div className="text-left space-y-4 pt-6 border-t-2 border-slate-100">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="p-2 bg-linear-to-br from-teal-500 to-cyan-500 rounded-lg">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {user?.email}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="p-2 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.phoneNumber || "Not provided"}
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="p-2 bg-linear-to-br from-orange-500 to-yellow-500 rounded-lg">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    Dhaka, Bangladesh
                  </span>
                </div>

                <div className="mt-6 p-4 bg-linear-to-r from-teal-50 to-purple-50 rounded-2xl border border-teal-100">
                  <p className="text-xs text-slate-500 font-medium mb-1">
                    Member Since
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(user?.createdAt || "").toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
