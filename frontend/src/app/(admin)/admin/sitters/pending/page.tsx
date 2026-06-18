"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  MapPin,
  User,
  DollarSign,
  Briefcase,
  Eye,
  ShieldAlert,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface PendingSitter {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  babysitter: {
    locationAddress: string;
    experienceYears: number;
    hourlyRate: string;
    gender: string;
    dob: string;
  };
}

// Modal State Type
interface ModalState {
  isOpen: boolean;
  type: "approve" | "reject" | null;
  id: number | null;
  name?: string;
}

export default function PendingSittersPage() {
  const [sitters, setSitters] = useState<PendingSitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 🔥 Modal State Config
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    id: null,
    name: "",
  });

  // Fetch Data
  const fetchSitters = async () => {
    try {
      const res = await axiosInstance.get("/admin/pending-sitters");
      if (res.data.success) {
        setSitters(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  // --- Actions ---

  // 1. Open Modal Logic
  const openConfirmModal = (
    type: "approve" | "reject",
    id: number,
    name: string
  ) => {
    setModal({ isOpen: true, type, id, name });
  };

  // 2. Close Modal
  const closeModal = () => {
    setModal({ isOpen: false, type: null, id: null, name: "" });
  };

  // 3. Final Execution (API Call)
  const handleConfirmAction = async () => {
    if (!modal.id || !modal.type) return;

    setActionLoading(true);
    try {
      if (modal.type === "approve") {
        await axiosInstance.put(`/admin/approve-sitter/${modal.id}`);
        toast.success(`${modal.name} has been Approved!`);
      } else {
        await axiosInstance.put(`/admin/reject-sitter/${modal.id}`);
        toast.error(`${modal.name} has been Rejected.`);
      }

      // Update UI List
      setSitters((prev) => prev.filter((s) => s.id !== modal.id));
      closeModal();
    } catch (error) {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header Skeleton */}
        <div className="space-y-2 pb-6 border-b border-slate-100 mb-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0 pb-6 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Approvals
          </h2>
          <p className="text-slate-500">
            Manage sitter verification requests ({sitters.length} pending)
          </p>
        </div>
      </div>

      {/* Content */}
      {sitters.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl">
          <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
            <CheckCircle className="h-8 w-8 text-teal-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            No Pending Requests
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Great job! You&apos;ve reviewed all applications.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Applicant
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Details
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Qualifications
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sitters.map((sitter) => (
                  <tr
                    key={sitter.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 uppercase">
                          {sitter.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {sitter.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {sitter.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {sitter.babysitter.locationAddress || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="capitalize">
                            {sitter.babysitter.gender || "Not specified"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {sitter.babysitter.experienceYears} Years Exp.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-teal-600 font-bold">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>{sitter.babysitter.hourlyRate} /hr</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          // 🔥 Trigger Modal Here
                          onClick={() =>
                            openConfirmModal("reject", sitter.id, sitter.name)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>

                        <button
                          // 🔥 Trigger Modal Here
                          onClick={() =>
                            openConfirmModal("approve", sitter.id, sitter.name)
                          }
                          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-teal-600 transition-all shadow-sm"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔥 CUSTOM MODAL OVERLAY */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div
              className={`p-6 border-b ${
                modal.type === "approve"
                  ? "bg-teal-50 border-teal-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-4 border-white ${
                      modal.type === "approve"
                        ? "bg-teal-100 text-teal-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {modal.type === "approve" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <ShieldAlert className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3
                      className={`text-lg font-bold ${
                        modal.type === "approve"
                          ? "text-teal-900"
                          : "text-red-900"
                      }`}
                    >
                      {modal.type === "approve"
                        ? "Approve Sitter"
                        : "Reject Application"}
                    </h3>
                    <p
                      className={`text-xs font-medium ${
                        modal.type === "approve"
                          ? "text-teal-600/80"
                          : "text-red-600/80"
                      }`}
                    >
                      {modal.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-slate-600 text-sm leading-relaxed">
                {modal.type === "approve"
                  ? "Are you sure you want to approve this application? The user will be listed as a verified Babysitter immediately."
                  : "Are you sure you want to reject this application? The user will be notified, and they won't be able to accept bookings."}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                  modal.type === "approve"
                    ? "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                    : "bg-red-600 hover:bg-red-700 shadow-red-200"
                }`}
              >
                {actionLoading && <Loader2 className="animate-spin h-4 w-4" />}
                {modal.type === "approve"
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
