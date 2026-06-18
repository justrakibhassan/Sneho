"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  CalendarDays,
  Copy,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// ✅ Type Definitions
interface IScheduleItem {
  active: boolean;
  start: string;
  end: string;
}

interface IApiAvailability {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export default function AvailabilityPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Default State
  const defaultSchedule: Record<string, IScheduleItem> = {
    MONDAY: { active: true, start: "09:00", end: "17:00" },
    TUESDAY: { active: true, start: "09:00", end: "17:00" },
    WEDNESDAY: { active: true, start: "09:00", end: "17:00" },
    THURSDAY: { active: true, start: "09:00", end: "17:00" },
    FRIDAY: { active: true, start: "09:00", end: "17:00" },
    SATURDAY: { active: false, start: "10:00", end: "14:00" },
    SUNDAY: { active: false, start: "10:00", end: "14:00" },
  };

  const [schedule, setSchedule] =
    useState<Record<string, IScheduleItem>>(defaultSchedule);

  // 📥 1. Load Data
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await axiosInstance.get("/sitters/availability");

        if (response.data.success) {
          const dbData: IApiAvailability[] = response.data.schedule;

          // If DB has data, merge it. Otherwise keep default.
          if (dbData.length > 0) {
            setSchedule((prev) => {
              const newSchedule = { ...prev };
              // Reset all to inactive first to match DB exactly
              Object.keys(newSchedule).forEach(
                (k) => (newSchedule[k].active = false)
              );

              dbData.forEach((item) => {
                if (DAYS.includes(item.dayOfWeek)) {
                  newSchedule[item.dayOfWeek] = {
                    active: true,
                    start: item.startTime,
                    end: item.endTime,
                  };
                }
              });
              return newSchedule;
            });
          }
        }
      } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
        console.error("Failed to load availability");
        toast.error("Could not load your schedule.");
      } finally {
        setFetching(false);
      }
    };

    if (isAuthenticated) fetchAvailability();
  }, [isAuthenticated]);

  // 🎮 Actions
  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  };

  const handleTimeChange = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // ✨ Feature: Copy Monday's time to all active days
  const copyMondayToAll = () => {
    const monday = schedule["MONDAY"];
    setSchedule((prev) => {
      const newState = { ...prev };
      DAYS.forEach((day) => {
        if (day !== "MONDAY" && newState[day].active) {
          newState[day].start = monday.start;
          newState[day].end = monday.end;
        }
      });
      return newState;
    });
    toast.success("Monday's time applied to all active days!");
  };

  // 💾 Save to Database
  const saveAvailability = async () => {
    setLoading(true);
    try {
      // 1. Prepare Payload
      const activeSchedule = Object.entries(schedule)
        .filter(([_, val]) => val.active)
        .map(([day, val]) => {
          // Validation: Check if Start is before End
          if (val.start >= val.end) {
            throw new Error(
              `Invalid time for ${day}. End time must be after Start time.`
            );
          }
          return {
            dayOfWeek: day,
            startTime: val.start,
            endTime: val.end,
          };
        });

      // 2. Send Request
      await axiosInstance.post("/sitters/availability", {
        schedule: activeSchedule,
      });

      toast.success("Schedule updated successfully!");
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const msg = error instanceof Error ? error.message : "Failed to update availability.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-40 rounded-xl" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* Schedule Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="divide-y divide-slate-50">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-8">
                <Skeleton className="h-7 w-12 rounded-full" />
                <Skeleton className="h-5 w-24" />
                <div className="flex-1 flex items-center gap-3">
                  <Skeleton className="h-10 w-36 rounded-xl" />
                  <span className="text-slate-300">-</span>
                  <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-teal-600" />
            Weekly Availability
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg">
            Set the days and hours you are available for work. Parents will only
            be able to book you within these windows.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button
            onClick={saveAvailability}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-teal-600 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-slate-200"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Changes
          </button>
          <button
            onClick={copyMondayToAll}
            className="text-xs font-bold text-slate-500 hover:text-teal-600 flex items-center justify-center gap-1 transition-colors"
          >
            <Copy className="h-3 w-3" /> Copy Monday&apos;s time to all
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Quick Actions Bar */}
        <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex gap-4 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider py-1">
            Quick Select:
          </span>
          <button
            onClick={() => setSchedule(defaultSchedule)}
            className="text-xs font-bold text-teal-600 hover:underline"
          >
            Reset Default
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {DAYS.map((day) => {
            const isActive = schedule[day].active;

            return (
              <div
                key={day}
                className={`p-5 transition-all duration-300 ${
                  isActive ? "bg-white" : "bg-slate-50/50 opacity-60"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                  {/* 1. Toggle Switch & Day Name */}
                  <div
                    className="flex items-center gap-4 w-40 shrink-0 cursor-pointer"
                    onClick={() => toggleDay(day)}
                  >
                    <div
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        isActive ? "bg-teal-500" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${
                          isActive ? "left-6" : "left-1"
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        isActive ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* 2. Time Inputs */}
                  <div className="flex-1">
                    {isActive ? (
                      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="relative group">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                          <input
                            type="time"
                            value={schedule[day].start}
                            onChange={(e) =>
                              handleTimeChange(day, "start", e.target.value)
                            }
                            className="pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm w-36"
                          />
                        </div>
                        <span className="text-slate-300 font-medium">-</span>
                        <div className="relative group">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                          <input
                            type="time"
                            value={schedule[day].end}
                            onChange={(e) =>
                              handleTimeChange(day, "end", e.target.value)
                            }
                            className="pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all shadow-sm w-36"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 italic flex items-center gap-2 px-2">
                        Not available
                      </span>
                    )}
                  </div>

                  {/* 3. Status Indicator */}
                  <div className="md:w-24 flex justify-end">
                    {isActive && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wide">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
