"use client";

import React, { useEffect, useState } from "react";
import {
  Coffee,
  Moon,
  Activity,
  Clock,
  Star,
  FileText,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
import axiosInstance from "@/lib/axios";

interface ActivityLog {
  id: number;
  type: "MEAL" | "NAP" | "ACTIVITY";
  description: string;
  photoUrl: string | null;
  timestamp: string;
}

interface DailyReport {
  id: number;
  notes: string | null;
  moodRating: number | null;
  createdAt: string;
  activitylog: ActivityLog[];
  booking: {
    startTime: string;
    endTime: string;
    babysitter: {
      user: {
        name: string;
        profilePicture: string | null;
      };
    };
  };
}

export default function DailyReportView({
  bookingId,
  onBack,
}: {
  bookingId: number;
  onBack: () => void;
}) {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId || isNaN(bookingId)) {
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await axiosInstance.get(
          `/activities/report/${bookingId}`
        );
        if (response.data.success) {
          setReport(response.data.report);
        }
      } catch (error: unknown) {
        // Handle 404 gracefully - it just means no report yet
        // Check if it's an axios error and has a 404 status
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          (error as { response?: { status?: number } }).response?.status === 404
        ) {
          setReport(null);
        } else {
          console.error("Failed to fetch report:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium italic">
          Generating report view...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-slate-50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-700">No Report Found</h3>
        <p className="text-slate-500 mt-2">
          The report for this session hasn&apos;t been generated yet.
        </p>
        <button
          onClick={onBack}
          className="mt-6 text-teal-600 font-bold hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "MEAL":
        return <Coffee className="w-5 h-5" />;
      case "NAP":
        return <Moon className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "MEAL":
        return "bg-orange-100 text-orange-600 border-orange-200";
      case "NAP":
        return "bg-indigo-100 text-indigo-600 border-indigo-200";
      default:
        return "bg-teal-100 text-teal-600 border-teal-200";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-3 hover:bg-slate-100 rounded-2xl transition"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Daily Summary
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Session Report for{" "}
            {format(new Date(report.booking.startTime), "PPP")}
          </p>
        </div>
      </div>

      {/* Sitter & Mood Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 opacity-50" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-600 overflow-hidden border-4 border-white shadow-lg relative">
              {report.booking.babysitter.user.profilePicture ? (
                <Image
                  src={report.booking.babysitter.user.profilePicture}
                  alt="Sitter"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">
                  {report.booking.babysitter.user.name[0]}
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-1">
                Babysitter
              </p>
              <h4 className="text-lg font-bold text-slate-800">
                {report.booking.babysitter.user.name}
              </h4>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Child&apos;s Mood
            </p>
            <div className="flex gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={
                    report.moodRating && report.moodRating >= star
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-1 before:bg-linear-to-b before:from-teal-500 before:via-blue-500 before:to-transparent before:rounded-full">
        {report.activitylog.map((log, idx) => (
          <div
            key={log.id}
            className="relative animate-in slide-in-from-left-4 duration-500"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Dot */}
            <div
              className={`absolute -left-[26px] top-1 w-4 h-4 rounded-full border-4 border-white ring-2 ring-teal-500 bg-teal-500`}
            />

            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-50 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getColors(
                    log.type
                  )} flex items-center gap-2`}
                >
                  {getIcon(log.type)}
                  {log.type}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(log.timestamp), "p")}
                </span>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed">
                {log.description}
              </p>

              {log.photoUrl && (
                <div className="mt-4 rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative h-48">
                  <Image
                    src={log.photoUrl}
                    alt="Activity"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Notes / Conclusion */}
        <div className="relative">
          <div className="absolute -left-[26px] top-1 w-4 h-4 rounded-full border-4 border-white ring-2 ring-slate-400 bg-slate-400" />
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h5 className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest mb-4">
              <CheckCircle2 className="text-teal-500 w-5 h-5" />
              Sitter&apos;s Final Notes
            </h5>
            <p className="text-slate-600 italic font-medium leading-relaxed">
              &quot;
              {report.notes || "No additional notes provided for this session."}
              &quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
