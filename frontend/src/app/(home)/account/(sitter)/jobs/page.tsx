"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  DollarSign,
  Video,
  MapPin,
  CheckCircle,
  Briefcase,
  Phone,
  MessageSquare,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import ConfirmActionModal from "@/components/confirm-modal";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";


// ✅ 1. Interface Definition
interface ISitterJob {
  id: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  startTime: string;
  endTime: string;
  totalAmount: number;
  parent: {
    user: {
      name: string;
      profilePicture?: string;
      phoneNumber?: string;
    };
    address?: string; // If available in your schema
  };
}

// ✅ 2. Action Type Definition
type ActionType = "approve" | "reject" | "complete";

export default function SitterJobsPage() {
  const [jobs, setJobs] = useState<ISitterJob[]>([]);
  const [loading, setLoading] = useState(true);

  // Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    id: null as number | null,
    type: "approve" as ActionType,
  });

  // 3. Fetch Jobs
  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get("/bookings/my-bookings");
      if (res.data.success) setJobs(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 4. Open Modal Handler
  const openActionModal = (id: number, type: ActionType) => {
    setModal({ isOpen: true, id, type });
  };

  // 5. Confirm Action (Approve / Reject / Complete)
  const confirmAction = async () => {
    if (!modal.id) return;
    setActionLoading(true);

    // Determine API Status based on Action Type
    let apiStatus = "";
    if (modal.type === "approve") apiStatus = "CONFIRMED";
    else if (modal.type === "reject") apiStatus = "REJECTED";
    else if (modal.type === "complete") apiStatus = "COMPLETED";

    try {
      await axiosInstance.put(`/bookings/sitter-action/${modal.id}`, {
        status: apiStatus,
      });

      let successMessage = "";
      if (modal.type === "approve") successMessage = "Job Accepted! ✅";
      else if (modal.type === "reject") successMessage = "Job Rejected ❌";
      else successMessage = "Job Marked as Completed! 🎉";

      toast.success(successMessage);

      // Update UI Optimistically
      setJobs((prev) =>
        prev.map((job) =>
          job.id === modal.id
            ? { ...job, status: apiStatus as ISitterJob["status"] }
            : job
        )
      );
      setModal({ ...modal, isOpen: false });
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Dynamic Modal Text Helper
  const getModalContent = () => {
    switch (modal.type) {
      case "approve":
        return {
          title: "Accept Job Request",
          desc: "Are you sure you want to accept this job? The parent will be notified.",
          btnText: "Yes, Accept",
        };
      case "reject":
        return {
          title: "Reject Job Request",
          desc: "Are you sure you want to reject this request? This cannot be undone.",
          btnText: "Yes, Reject",
        };
      case "complete":
        return {
          title: "Complete Job",
          desc: "Are you sure the job is done? This will allow the parent to review you.",
          btnText: "Yes, Mark Completed",
        };
    }
  };

  const modalContent = getModalContent();

  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-12">
          <div className="space-y-2">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-16 w-40 rounded-2xl" />
        </div>

        {/* Jobs Skeleton */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100"
            >
              <div className="flex gap-8">
                <Skeleton className="h-20 w-20 rounded-3xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-7 w-48" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="w-48 space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Rich Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-teal-500 rounded-full" />
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Job Requests
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-500" />
            Review and manage your incoming bookings
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-5 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Available
              </p>
              <p className="text-sm font-bold text-slate-900">Online Now</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-50 shadow-sm border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Briefcase size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              No Active Requests
            </h3>
            <p className="text-slate-500 font-medium">
              Sit tight! New opportunities will appear here soon.
            </p>
          </div>
        ) : (
          jobs.map((job) => {
            const parent = job.parent?.user;
            if (!parent) return null;

            return (
              <div
                key={job.id}
                className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 relative overflow-hidden"
              >
                {/* Decorative background element for Pending */}
                {job.status === "PENDING" && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-teal-100/50 transition-colors" />
                )}

                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                  {/* --- Left: Parent Profile & Main Info --- */}
                  <div className="flex gap-6 flex-1">
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 rounded-3xl overflow-hidden ring-4 ring-slate-50 shadow-lg shadow-slate-200">
                        {parent.profilePicture ? (
                          <img
                            src={parent.profilePicture}
                            alt={parent.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-2xl font-black">
                            {parent.name[0]}
                          </div>
                        )}
                      </div>
                      {job.status === "PENDING" && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 bg-teal-500 rounded-full border-4 border-white animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">
                          {parent.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                              job.status === "PENDING"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : job.status === "CONFIRMED"
                                ? "bg-teal-50 text-teal-600 border border-teal-100"
                                : "bg-slate-100 text-slate-500 "
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                job.status === "PENDING"
                                  ? "bg-amber-500 animate-ping"
                                  : job.status === "CONFIRMED"
                                  ? "bg-teal-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {job.status}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            |
                          </span>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={12} />{" "}
                            {job.parent.address || "Location TBD"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <Calendar size={16} className="text-teal-600" />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Date
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(job.startTime).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                          <Clock size={16} className="text-teal-600" />
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Time Slot
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {new Date(job.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(job.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- Right: Budget & Action Center --- */}
                  <div className="lg:w-48 flex flex-col justify-between items-end border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-8">
                    <div className="text-right w-full">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Total Earning
                      </p>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs font-black text-teal-600">
                          TK
                        </span>
                        <span className="text-4xl font-black text-slate-900">
                          {job.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Action Hub */}
                    <div className="w-full mt-6 space-y-2">
                      {job.status === "PENDING" && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openActionModal(job.id, "approve")}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-teal-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group/btn"
                          >
                            Accept Request{" "}
                            <ChevronRight
                              size={16}
                              className="group-hover/btn:translate-x-1 transition-transform"
                            />
                          </button>
                          <button
                            onClick={() => openActionModal(job.id, "reject")}
                            className="w-full py-3 text-slate-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {job.status === "CONFIRMED" && (
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/meeting/${job.id}`}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 animate-pulse"
                          >
                            <Video size={18} /> Join Meeting
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              href="/account/my-sessions"
                              className="py-3 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-teal-100 transition-all flex items-center justify-center gap-1.5"
                            >
                              <MapPin size={12} /> Session
                            </Link>
                            <button
                              onClick={() =>
                                openActionModal(job.id, "complete")
                              }
                              className="py-3 bg-green-50 text-green-700 border border-green-100 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle size={12} /> Finish
                            </button>
                          </div>
                        </div>
                      )}

                      {job.status === "COMPLETED" && (
                        <div className="w-full p-3 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest border border-slate-100">
                          <CheckCircle size={14} className="text-green-500" />{" "}
                          Done
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        open={modal.isOpen}
        type={modal.type === "reject" ? "reject" : "approve"} // Pass appropriate color type
        titleApprove={modalContent.title}
        titleReject={modalContent.title}
        description={modalContent.desc}
        confirmTextApprove={modalContent.btnText}
        confirmTextReject={modalContent.btnText}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={confirmAction}
        loading={actionLoading}
      />
    </div>
  );
}
