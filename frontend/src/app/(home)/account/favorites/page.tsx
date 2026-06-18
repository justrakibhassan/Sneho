"use client";

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import {
  Heart,
  Star,
  MapPin,
  ArrowRight,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useFavorites } from "@/context/favorites-context";

import { Skeleton } from "@/components/ui/skeleton";

interface ISitter {
  id: number;
  userId: number;
  locationAddress: string | null;
  hourlyRate: number | string;
  experienceYears: number;
  bio: string | null;
  averageRating: number | string;
  totalRatings: number;
  user: {
    name: string;
    profilePicture?: string | null;
    email: string;
  };
}

const FavoritesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex gap-6">
          <Skeleton className="w-24 h-24 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const { toggleFavorite, updateFavorites } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<ISitter[]>([]);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "PARENT") {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.get("/favorites");
      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error: unknown) {
      console.error("Fetch Favorites Error:", error);
      // Handle the error type safely
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status !== 404) {
        toast.error("Failed to load favorites");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "PARENT") {
        updateFavorites().then(() => fetchFavorites());
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user?.role, updateFavorites, fetchFavorites]);

  const handleRemoveFavorite = async (sitterId: number) => {
    try {
      // Use global toggleFavorite to sync navbar immediately
      await toggleFavorite(sitterId);
      setFavorites((prev) => prev.filter((s) => s.id !== sitterId));
      toast.success("Removed from favorites");
    } catch {
      toast.error("Failed to remove favorite");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> My
            Favorites
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Quickly find and book your saved babysitters.
          </p>
        </div>
        <Link
          href="/find-sitter"
          className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-teal-600 transition-all text-sm shadow-xl shadow-slate-900/10 flex items-center gap-2"
        >
          <Search className="w-4 h-4" /> Find More Sitters
        </Link>
      </div>

      {loading ? (
        <FavoritesSkeleton />
      ) : favorites.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-100 shadow-sm border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
            <Heart size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            No Favorites Yet
          </h3>
          <p className="text-slate-500 font-medium mb-8">
            Save your favorite sitters to find them easily later.
          </p>
          <Link
            href="/find-sitter"
            className="text-teal-600 font-black hover:underline flex items-center justify-center gap-2"
          >
            Start exploring sitters <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {favorites.map((sitter) => (
            <div
              key={sitter.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="flex gap-6">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  {sitter.user.profilePicture ? (
                    <Image
                      src={sitter.user.profilePicture}
                      alt={sitter.user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300">
                      {sitter.user.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 truncate pr-8">
                        {sitter.user.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold text-slate-700">
                          {Number(sitter.averageRating).toFixed(1)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          ({sitter.totalRatings} reviews)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(sitter.id)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="truncate">
                        {sitter.locationAddress || "Dhaka, Bangladesh"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-black text-slate-900">
                        ৳{sitter.hourlyRate}/hr
                      </span>
                      <Link
                        href={`/sitter/${sitter.userId}`}
                        className="px-5 py-2 bg-teal-50 text-teal-700 font-black text-xs rounded-xl hover:bg-teal-600 hover:text-white transition-all"
                      >
                        Visit Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
