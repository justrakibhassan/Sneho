"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import DailyReportView from "@/components/booking/DailyReportView";
import { ChevronLeft } from "lucide-react";

export default function SitterReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  if (!id) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-teal-600 transition-colors group"
        >
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-teal-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </div>
          Back to Reports
        </button>
      </div>

      <DailyReportView
        bookingId={parseInt(id as string)}
        onBack={() => router.back()}
      />
    </div>
  );
}
