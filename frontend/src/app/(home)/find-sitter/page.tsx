"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error-handler";
import {
  Search,
  MapPin,
  Star,
  ArrowRight,
  X,
  ChevronDown,
  Award,
  RefreshCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Layers,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/context/favorites-context";
import {
  useQueryStates,
  parseAsInteger,
  parseAsString,
  parseAsFloat,
} from "nuqs";

// ✅ 1. Strict Type Definitions (Real DB Structure)
interface IBabysitterDetails {
  id: number;
  locationAddress: string | null;
  hourlyRate: number | string; // Prisma sometimes returns Decimal as string
  experienceYears: number;
  bio: string | null;
  averageRating: number | string;
  totalRatings: number;
  latitude?: number | null;
  longitude?: number | null;
  isApproved?: boolean;
  availabilities?: { dayOfWeek: string; startTime: string; endTime: string }[];
}

interface ISitter {
  id: number;
  name: string;
  profilePicture?: string | null;
  babysitter: IBabysitterDetails | null;
  matchScore?: number;
  breakdown?: {
    location: number;
    availability: number;
    budget: number;
    personality: number;
    experience: number;
    rating: number;
  };
}

// ✅ 2. Filter Interface (Replaced by useQueryStates)

function FindSitterContent() {
  const router = useRouter();
  const [sitters, setSitters] = useState<ISitter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { isAuthenticated, user } = useAuth();

  // Smart Match state
  const [matchLoading, setMatchLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileError, setProfileError] = useState<string>("");

  // 🔍 Filters State (Persistent in URL via nuqs)
  const [filters, setFilters] = useQueryStates(
    {
      location: parseAsString.withDefault(""),
      maxPrice: parseAsInteger.withDefault(2000),
      minExp: parseAsInteger.withDefault(0),
      minRating: parseAsFloat.withDefault(0),
      skills: parseAsString.withDefault(""),
      gender: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
    },
    {
      shallow: false, // Update URL and trigger fetch
      history: "replace",
    }
  );

  const [sortBy, setSortBy] = useState<string>("recommended");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [totalSitters, setTotalSitters] = useState<number>(0);

  // 📥 Fetch Sitters Function
  const fetchSitters = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.minExp > 0)
        params.append("minExp", filters.minExp.toString());
      if (filters.minRating > 0)
        params.append("minRating", filters.minRating.toString());
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.skills) params.append("skills", filters.skills);
      params.append("page", filters.page.toString());
      params.append("limit", "10");

      const response = await axiosInstance.get(`/sitters?${params.toString()}`);

      if (response.data.success) {
        // ✅ ESLint Fix: Used 'const' instead of 'let'
        const data: ISitter[] = response.data.sitters;

        // ✅ TypeScript Fix: Removing 'any' and using strict types for sorting
        if (sortBy !== "recommended") {
          data.sort((a: ISitter, b: ISitter) => {
            const rateA = Number(a.babysitter?.hourlyRate || 0);
            const rateB = Number(b.babysitter?.hourlyRate || 0);
            const ratingA = Number(a.babysitter?.averageRating || 0);
            const ratingB = Number(b.babysitter?.averageRating || 0);

            if (sortBy === "price_asc") return rateA - rateB;
            if (sortBy === "price_desc") return rateB - rateA;
            if (sortBy === "rating") return ratingB - ratingA;
            return 0;
          });
        }

        setSitters(data);
        setTotalSitters(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching sitters", error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]); // Dependencies for useCallback

  const onToggleFavorite = async (e: React.MouseEvent, sitterId: number) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    await toggleFavorite(sitterId, e.clientX, e.clientY);
  };

  // Initial Fetch & Auto-Refetch on Filter Change
  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  const resetFilters = () => {
    setFilters({
      location: "",
      maxPrice: 2000,
      minExp: 0,
      minRating: 0,
      skills: "",
      gender: "",
      page: 1,
    });
    setSortBy("recommended");
    // fetchSitters will trigger automatically due to useEffect dependency
  };

  // 🎯 Smart Match Function
  const handleSmartMatch = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // Check if user is a parent
    if (user?.role !== "PARENT") {
      setProfileError(
        "Smart Match is only available for parents looking for babysitters."
      );
      setShowProfileModal(true);
      return;
    }

    // 🔍 DEBUG: Log user data to console
    console.log("🔍 User Data:", user);
    console.log("🔍 Parent Profile:", (user as { parent?: unknown })?.parent);

    // Check if parent profile exists and has required data
    const parentProfile = (user as { parent?: { locationAddress?: string; minBudget?: number; preferences?: string; maxBudget?: number } })?.parent;
    if (!parentProfile) {
      console.error("❌ Parent profile is NULL or UNDEFINED");
      setProfileError(
        "Parent profile not found. Please complete your profile in settings to use Smart Match."
      );
      setShowProfileModal(true);
      return;
    }

    // Check if essential profile data is complete
    console.log("✅ Parent Profile Found:", {
      locationAddress: parentProfile.locationAddress,
      preferences: parentProfile.preferences,
      minBudget: parentProfile.minBudget,
      maxBudget: parentProfile.maxBudget,
    });

    // Only check for location and budget (preferences is optional)
    if (!parentProfile.locationAddress || !parentProfile.minBudget) {
      console.error("❌ Missing location or budget");
      setProfileError(
        "Please complete your profile with location and budget to use Smart Match."
      );
      setShowProfileModal(true);
      return;
    }

    setMatchLoading(true);
    try {
      const response = await axiosInstance.get("/matching/find-sitters");

      if (response.data.success) {
        // Transform matched sitters to ISitter format
        const matchedSitters: ISitter[] = response.data.matches.map(
          (match: {
            sitter: {
              userId: number;
              name: string;
              profilePicture?: string;
              id: number;
              locationAddress: string | null;
              hourlyRate: number | string;
              experienceYears: number;
              bio: string | null;
              averageRating: number | string;
              totalRatings: number;
              isApproved: boolean;
            };
            matchScore: number;
            breakdown: {
              location: number;
              availability: number;
              budget: number;
              personality: number;
              experience: number;
              rating: number;
            };
          }) => ({
            id: match.sitter.userId,
            name: match.sitter.name,
            profilePicture: match.sitter.profilePicture,
            babysitter: {
              id: match.sitter.id,
              locationAddress: match.sitter.locationAddress,
              hourlyRate: match.sitter.hourlyRate,
              experienceYears: match.sitter.experienceYears,
              bio: match.sitter.bio,
              averageRating: match.sitter.averageRating,
              totalRatings: match.sitter.totalRatings,
              isApproved: match.sitter.isApproved,
            },
            matchScore: match.matchScore,
            breakdown: match.breakdown,
          })
        );

        setSitters(matchedSitters);
        toast.success(`Found ${response.data.total} top matches for you!`);
      }
    } catch (error: unknown) {
      console.error("Smart Match Error:", error);
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };

      // Handle specific error cases
      if (
        axiosError?.response?.status === 404 ||
        axiosError?.response?.data?.message?.includes("profile not found")
      ) {
        setProfileError(
          axiosError?.response?.data?.message ||
            "Parent profile not found. Please complete your profile to use Smart Match."
        );
        setShowProfileModal(true);
      } else if (
        axiosError?.response?.data?.message?.includes("complete your profile")
      ) {
        setProfileError(axiosError?.response?.data?.message);
        setShowProfileModal(true);
      } else {
        const message = getErrorMessage(error, "Failed to find matches");
        toast.error(message);
      }
    } finally {
      setMatchLoading(false);
    }
  };

  const handleLocationSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleBookClick = (sitterId: number) => {
    if (isAuthenticated) {
      // If logged in, go directly to sitter profile
      router.push(`/sitter/${sitterId}`);
    } else {
      // If not logged in, go to login page (with redirect link)
      router.push(`/login?redirect=/sitter/${sitterId}`);
    }
  };
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {/* 1. Header Section with Background Pattern */}
      <div className="pt-32 pb-12 relative overflow-hidden">
        {/* Subtle Wave Background - Mockup with Gradients */}
        <div className="absolute top-0 left-0 w-full h-80 bg-linear-to-b from-[#E2E8F0] to-[#F0F4F8] opacity-50 -z-10" />
        <div className="absolute top-10 left-0 w-full opacity-10 -z-10">
          <svg viewBox="0 0 1440 320" className="w-full h-64 fill-indigo-500">
            <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#1E293B] mb-8">
              Find Babysitters Near You
            </h1>

            {/* Horizontal Search Bar */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Location Input */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <MapPin className="h-4 w-4 text-[#10B981]" />
                    <span className="text-sm font-bold text-slate-400">
                      Location
                    </span>
                  </div>
                  <select
                    className="w-full pl-28 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none hover:bg-white transition-all appearance-none cursor-pointer"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        location: e.target.value,
                        page: 1,
                      })
                    }
                  >
                    <option value="">Select location</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Date Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#10B981]" />
                    <span className="text-sm font-bold text-slate-400">
                      Date
                    </span>
                  </div>
                  <select className="w-full pl-20 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none hover:bg-white transition-all appearance-none cursor-pointer">
                    <option value="">Select date</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Anytime Input */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#10B981]" />
                    <span className="text-sm font-bold text-slate-400">
                      Anytime
                    </span>
                  </div>
                  <select className="w-full pl-28 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none hover:bg-white transition-all appearance-none cursor-pointer">
                    <option value="">Anytime</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={handleLocationSearch}
                className="w-full md:w-auto px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 whitespace-nowrap"
              >
                Search Babysitters
              </button>

              {/* Advanced / Smart Match */}
              <div className="px-4 border-l border-slate-100 hidden md:flex items-center gap-4">
                <button
                  onClick={handleSmartMatch}
                  disabled={matchLoading}
                  className={`text-sm font-bold flex items-center gap-2 transition-all ${
                    matchLoading
                      ? "text-slate-300"
                      : "text-[#10B981] hover:text-[#059669]"
                  }`}
                >
                  <Award
                    className={`h-4 w-4 ${matchLoading ? "" : "animate-pulse"}`}
                  />
                  {matchLoading ? "Matching..." : "Smart Match"}
                </button>
                <div className="h-4 w-px bg-slate-100" />
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="text-sm font-bold text-slate-400 hover:text-[#10B981] flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  Advanced Filters <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* 2. Filter Sidebar */}
          <aside
            className={`fixed inset-0 z-40 bg-black/50 lg:static lg:bg-transparent lg:z-auto lg:block transition-all ${
              showMobileFilters ? "block" : "hidden"
            }`}
          >
            <div className="h-full lg:h-auto w-3/4 lg:w-full bg-white p-6 lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm overflow-y-auto lg:overflow-visible relative">
              <div className="flex justify-between items-center lg:hidden mb-6">
                <h3 className="font-black text-lg text-slate-900">Filters</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="hidden lg:block">
                  <h3 className="text-lg font-black text-[#1E293B] mb-1">
                    Filters
                  </h3>
                </div>

                {/* Location Dropdown */}
                <div className="space-y-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-lg">
                    <label className="text-sm font-bold text-[#1E293B]">
                      Location
                    </label>
                  </div>
                  <div className="relative group/select">
                    <select
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all appearance-none cursor-pointer"
                      value={filters.location}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          location: e.target.value,
                          page: 1,
                        })
                      }
                    >
                      <option value="">Select location</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                    </select>
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Experience Level */}
                <div className="space-y-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-lg">
                    <label className="text-sm font-bold text-[#1E293B]">
                      Experience Level
                    </label>
                  </div>
                  <div className="space-y-2.5 px-1">
                    {[1, 3, 5].map((year) => (
                      <label
                        key={year}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 appearance-none rounded-md border-2 border-slate-200 checked:bg-[#10B981] checked:border-[#10B981] transition-all cursor-pointer"
                            checked={filters.minExp === year}
                            onChange={() =>
                              setFilters({
                                ...filters,
                                minExp: filters.minExp === year ? 0 : year,
                                page: 1,
                              })
                            }
                          />
                          <svg
                            className="absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-tight">
                          {year}+ Years
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hourly Rate slider */}
                <div className="space-y-3">
                  <div className="bg-slate-50 px-4 py-2 rounded-lg">
                    <label className="text-sm font-bold text-[#1E293B]">
                      Hourly Rate
                    </label>
                  </div>
                  <div className="px-1 pt-2">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-black text-slate-700">
                        ৳ 100 - ৳ {filters.maxPrice}
                      </span>
                      <div className="flex items-center gap-1 border border-slate-100 rounded-md px-2 py-1 bg-slate-50">
                        <span className="text-[10px] font-black text-slate-400">
                          ৳
                        </span>
                        <input
                          type="number"
                          className="w-12 bg-transparent text-xs font-black text-slate-700 outline-none"
                          value={filters.maxPrice}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              maxPrice: Number(e.target.value),
                              page: 1,
                            })
                          }
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3000"
                      step="50"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxPrice: Number(e.target.value),
                          page: 1,
                        })
                      }
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={fetchSitters}
                    className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" /> Apply Filters
                  </button>
                  <button
                    onClick={resetFilters}
                    className="w-full py-3.5 bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 font-bold text-sm rounded-xl transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* 3. Results Grid */}
          <div className="lg:col-span-3 min-h-[500px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-[#1E293B]">
                {totalSitters} Babysitters{" "}
                <span className="text-slate-400 font-bold ml-1">found</span>
              </h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-10">
                  <button
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        page: Math.max(1, filters.page - 1),
                      })
                    }
                    className="px-4 hover:bg-slate-50 text-slate-400 hover:text-[#10B981] disabled:opacity-30 disabled:hover:bg-transparent transition-all border-r border-slate-100 flex items-center gap-2 font-bold text-xs"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <div className="px-5 text-sm font-black text-[#10B981] bg-emerald-50 h-full flex items-center border-r border-slate-100">
                    {filters.page}
                  </div>
                  <button
                    disabled={filters.page >= Math.ceil(totalSitters / 10)}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page + 1 })
                    }
                    className="px-4 hover:bg-slate-50 text-slate-400 hover:text-[#10B981] disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-2 font-bold text-xs"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl h-64 border border-slate-100 animate-pulse shadow-sm"
                  />
                ))}
              </div>
            ) : sitters.length === 0 ? (
              <div className="bg-white rounded-[32px] p-24 border border-slate-200 flex flex-col items-center text-center shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-2xl font-black text-[#1E293B]">
                  No babysitters found
                </h3>
                <p className="text-slate-400 font-bold mt-2 max-w-sm">
                  We couldn&apos;t find any sitters matching your current
                  filters. Try relaxing your criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-8 px-10 py-4 bg-white border border-slate-200 hover:border-[#10B981] text-slate-500 hover:text-[#10B981] font-black text-sm rounded-2xl transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sitters.map((sitter) => {
                  const profile = sitter.babysitter;
                  if (!profile) return null;
                  const rating = Number(profile.averageRating || 0);
                  const rate = Number(profile.hourlyRate || 0);

                  return (
                    <div
                      key={sitter.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-[#10B981]/5 transition-all group flex flex-col sm:flex-row gap-5 relative overflow-hidden"
                    >
                      {/* Avatar & Floating Price */}
                      <div className="w-full sm:w-44 h-44 bg-slate-100 rounded-xl overflow-hidden shrink-0 relative group-hover:scale-[1.02] transition-transform duration-500">
                        {sitter.profilePicture ? (
                          <Image
                            src={sitter.profilePicture}
                            alt={sitter.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300 bg-slate-50">
                            {sitter.name.charAt(0)}
                          </div>
                        )}
                        {/* Price Badge Overlay */}
                        <div className="absolute bottom-3 left-3 bg-[#10B981] text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 z-10 transition-transform group-hover:translate-x-1">
                          <ShieldCheck className="h-3.5 w-3.5 fill-white/20" />
                          <span className="text-[11px] font-black tracking-tight">
                            ৳{rate}/hr
                          </span>
                        </div>
                        {/* Match Score Overlay */}
                        {sitter.matchScore && sitter.matchScore > 0 && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-black text-[#10B981] border border-emerald-100 uppercase tracking-tighter">
                            {sitter.matchScore}% Match
                          </div>
                        )}

                        {/* Favorite Button */}
                        {user?.role === "PARENT" || !isAuthenticated ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onToggleFavorite(e, profile.id);
                            }}
                            className="absolute top-3 left-3 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm transition-all hover:scale-110 active:scale-90 group/heart z-20"
                          >
                            <Heart
                              className={`h-4 w-4 transition-colors ${
                                favoriteIds.includes(profile.id)
                                  ? "fill-rose-500 text-rose-500"
                                  : "text-slate-400 group-hover/heart:text-rose-500"
                              }`}
                            />
                          </button>
                        ) : null}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <h4 className="text-xl font-black text-[#1E293B] group-hover:text-[#10B981] transition-colors truncate">
                              {sitter.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              {profile.isApproved && (
                                <div className="flex items-center gap-1 bg-[#10B981] text-white px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest">
                                  <ShieldCheck className="h-2.5 w-2.5" />{" "}
                                  Verified
                                </div>
                              )}
                              <div className="flex gap-0.5 ml-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < Math.floor(rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-100 fill-slate-100"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 translate-y-0.5">
                            <MapPin className="h-3.5 w-3.5 text-[#10B981]" />
                            <span className="truncate">
                              {profile.locationAddress || "Dhaka, Bangladesh"}
                            </span>
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-[#1E293B]">
                              ৳ {rate}/hr
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Available Now
                            </span>
                          </div>
                        </div>

                        <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-2 block w-full mb-5">
                          {profile.bio ||
                            "Loving and responsible babysitter with a passion for childcare, caring, fun & punctual. Enjoys reading stories and playing games."}
                        </p>

                        <div className="flex items-center gap-3">
                          <Link
                            href={`/sitter/${sitter.id}`}
                            className="flex-1 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#1E293B] font-black text-xs rounded-xl transition-all text-center shadow-sm"
                          >
                            View Profile
                          </Link>

                          <button
                            onClick={() => handleBookClick(sitter.id)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-50 active:scale-95"
                          >
                            Book Now <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Pagination */}
            {!loading && sitters.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-16 p-4">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: 1 })}
                  className="w-11 h-11 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all bg-white shadow-sm disabled:opacity-20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(Math.ceil(totalSitters / 10))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: i + 1 })}
                    className={`w-11 h-11 rounded-2xl text-xs font-black transition-all shadow-sm ${
                      filters.page === i + 1
                        ? "bg-[#10B981] text-white shadow-[#10B981]/20"
                        : "bg-white border border-slate-200 text-slate-400 hover:border-[#10B981] hover:text-[#10B981]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={filters.page >= Math.ceil(totalSitters / 10)}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      page: Math.ceil(totalSitters / 10),
                    })
                  }
                  className="w-11 h-11 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all bg-white shadow-sm disabled:opacity-20"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Required Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-linear-to-br from-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-teal-200">
                  <ShieldCheck className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900">
                    Authentication Required
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Please login to use our Smart Match feature and find the
                    perfect babysitter for your family.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="w-full py-4 bg-linear-to-r from-teal-600 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Login to Continue
                  </Link>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Completion Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-linear-to-br  from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-200">
                  <Layers className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900">
                    Complete Your Profile
                  </h3>
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <p className="text-sm text-orange-900 font-medium leading-relaxed">
                      {profileError ||
                        "Please complete your parent profile to use Smart Match."}
                    </p>
                  </div>
                  <p className="text-slate-600 text-sm">
                    Smart Match requires information about your family and
                    children to find the best caregivers for you.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/account/settings"
                    className="w-full py-4 bg-linear-to-r from-orange-600 to-amber-600 text-white rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Complete Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileModal(false);
                      setProfileError("");
                    }}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FindSitterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 pt-32 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <FindSitterContent />
    </Suspense>
  );
}
