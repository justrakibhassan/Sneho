"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import proxy from "@/lib/proxy";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApprovalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true);
  const [actionData, setActionData] = useState<{
    type: "approve" | "reject";
  } | null>(null);

  // 1. Fetch Full Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await proxy.get(`/admin/users/${params.id}`);
        if (res.data.success) setUser(res.data.user);
      } catch (error) {
        toast.error("User not found");
        router.push("/admin/approvals");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [params.id, router]);

  // 2. Handle Approve/Reject
  const handleAction = async () => {
    if (!actionData || !user) return;

    try {
      if (actionData.type === "approve") {
        await proxy.put(`/admin/approve/${user.id}`);
        toast.success("User Approved Successfully!");
      } else {
        // Reject Logic (Delete or Ban)
        await proxy.patch(`/admin/users/${user.id}`, { action: "delete" });
        toast.success("Application Rejected.");
      }
      router.push("/admin/approvals"); // লিস্ট পেজে ফেরত পাঠান
    } catch (error) {
      toast.error("Action Failed");
    } finally {
      setActionData(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-teal-600 h-10 w-10" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in slide-in-from-right-4 duration-500">
      {/* 1. Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-bold text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to List
      </button>

      {/* 2. Profile Header Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start mb-6">
        <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-400 shrink-0">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md border border-orange-200">
              Pending Review
            </span>
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-teal-500" /> {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-teal-500" /> Joined:{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
          <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-2">
            Professional Info
          </h3>

          {user.babysitter ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Experience
                </span>
                <span className="font-bold text-slate-800">
                  {user.babysitter.experienceYears} Years
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </span>
                <span className="font-bold text-slate-800">
                  {user.babysitter.locationAddress || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Rate
                </span>
                <span className="font-bold text-slate-800">
                  ৳{user.babysitter.hourlyRate} / hr
                </span>
              </div>
            </div>
          ) : (
            <p className="text-red-500 font-bold text-sm">
              Sitter profile not setup properly.
            </p>
          )}
        </div>

        {/* Bio Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 border-b border-slate-50 pb-2 mb-4">
            About Candidate
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
            {user.babysitter?.bio || "No bio provided by the candidate."}
          </p>
        </div>
      </div>

      {/* 4. Sticky Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 bg-slate-900 text-white p-2 pl-6 pr-2 rounded-full shadow-2xl flex items-center gap-4 z-50 border border-slate-700 w-[90%] md:w-auto justify-between md:justify-start">
        <span className="text-sm font-bold text-slate-300 hidden md:block">
          Take Action:
        </span>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setActionData({ type: "reject" })}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
          <button
            onClick={() => setActionData({ type: "approve" })}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm transition-all shadow-lg shadow-teal-900/50"
          >
            <CheckCircle className="h-4 w-4" /> Approve Sitter
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={!!actionData} onOpenChange={() => setActionData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Decision</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              <span className="font-bold uppercase">{actionData?.type}</span>{" "}
              this candidate?
              {actionData?.type === "approve"
                ? " They will immediately appear in search results."
                : " This will permanently delete their application."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={
                actionData?.type === "approve" ? "bg-teal-600" : "bg-red-600"
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
