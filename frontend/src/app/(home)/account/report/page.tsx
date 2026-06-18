"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import {
  ClipboardList,
  Calendar,
  User,
  ChevronRight,
  Loader2,
  FileText,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Report {
  id: number;
  bookingId: number;
  notes: string;
  moodRating: number;
  createdAt: string;
  booking: {
    parent: {
      user: {
        name: string;
        profilePicture?: string;
      };
    };
    babysitter: {
      user: {
        name: string;
        profilePicture?: string;
      };
    };
  };
  _count: {
    activitylog: number;
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      try {
        const endpoint =
          user.role === "PARENT"
            ? "/activities/parent-reports"
            : "/activities/reports";
        const res = await axiosInstance.get(endpoint);
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-teal-600" /> Daily Reports
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {user?.role === "PARENT"
              ? "Review sessions and daily summaries shared by your sitters."
              : "Review the historical logs and notes you've sent to parents."}
          </p>
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => {
            const otherUser =
              user?.role === "PARENT"
                ? report.booking.babysitter.user
                : report.booking.parent.user;

            return (
              <Link
                key={report.id}
                href={`/account/report/${report.bookingId}`}
                className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100 transition-all hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100">
                        {otherUser.profilePicture ? (
                          <Image
                            src={otherUser.profilePicture}
                            alt={otherUser.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                            {otherUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          {otherUser.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-xl">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-black">
                        {report.moodRating || 0}/5
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-sm text-slate-600 font-medium line-clamp-2 italic">
                      &quot;{report.notes || "No summary notes provided."}&quot;
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      {report._count.activitylog} Activities
                    </div>
                  </div>
                  <div className="p-2 bg-slate-900 text-white rounded-xl group-hover:bg-teal-600 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            No Reports Yet
          </h3>
          <p className="text-slate-400 font-bold mb-8">
            Start a session and log activities to see reports here.
          </p>
          <Link
            href="/account/my-sessions"
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10"
          >
            Go to Sessions
          </Link>
        </div>
      )}
    </div>
  );
}
