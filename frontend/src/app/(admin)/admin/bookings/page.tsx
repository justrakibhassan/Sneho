"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import {
  Clock,
  DollarSign,
  Search,
  Filter,
  AlertTriangle,
  CheckSquare,
  XSquare,
  RefreshCw,
} from "lucide-react";
import ConfirmActionModal from "@/components/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---
interface Booking {
  id: number;
  status: "PENDING" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  startTime: string;
  endTime: string;
  totalAmount: number;
  parent: {
    user: { name: string; email: string; phoneNumber: string };
  };
  babysitter: {
    user: { name: string };
  };
}

interface ModalState {
  isOpen: boolean;
  bookingId: number | null;
  actionType: "COMPLETED" | "CANCELLED" | null; // Action to perform
  parentName: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal & Loading State
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    bookingId: null,
    actionType: null,
    parentName: "",
  });

  // 1. Fetch Data
  const fetchBookings = async () => {
    try {
      const res = await axiosInstance.get("/admin/bookings");
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 2. Open Modal Logic
  const openActionModal = (
    bookingId: number,
    actionType: "COMPLETED" | "CANCELLED",
    parentName: string
  ) => {
    setModal({
      isOpen: true,
      bookingId,
      actionType,
      parentName,
    });
  };

  // 3. Close Modal
  const closeModal = () => {
    setModal({
      isOpen: false,
      bookingId: null,
      actionType: null,
      parentName: "",
    });
  };

  // 4. Confirm Action (API Call)
  const handleConfirmAction = async () => {
    if (!modal.bookingId || !modal.actionType) return;

    setActionLoading(true);
    try {
      const res = await axiosInstance.put(
        `/admin/bookings/${modal.bookingId}`,
        {
          status: modal.actionType,
        }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        // Update Local State without Refetching
        setBookings((prev) =>
          prev.map((b) =>
            b.id === modal.bookingId
              ? { ...b, status: modal.actionType as Booking["status"] }
              : b
          )
        );
        closeModal();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Helpers ---
  const totalRevenue = bookings.reduce(
    (acc, curr) => acc + (curr.status === "COMPLETED" ? curr.totalAmount : 0),
    0
  );
  const activeCount = bookings.filter((b) => b.status === "ACCEPTED").length;
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.parent.user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.babysitter.user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
      COMPLETED: "bg-teal-50 text-teal-700 border-teal-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="space-y-8 p-6 md:p-10">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>

        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40 rounded-2xl" />
            <Skeleton className="h-12 w-72 rounded-2xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6">
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 p-6 md:p-10 animate-in fade-in duration-500">
      {/* 📊 Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl">
            <DollarSign className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-3xl font-black text-slate-800">
              ৳{totalRevenue}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Pending
            </p>
            <p className="text-3xl font-black text-slate-800">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <RefreshCw className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Active
            </p>
            <p className="text-3xl font-black text-slate-800">{activeCount}</p>
          </div>
        </div>
      </div>

      {/* 🔍 Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-1">
            Manage reservations and track status.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-40 bg-white border border-slate-200 pl-4 pr-10 py-3 rounded-2xl text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-teal-500 transition-shadow cursor-pointer"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Filter className="absolute right-3 top-3.5 h-4 w-4 text-slate-400 pointer-events-none group-hover:text-teal-600 transition-colors" />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search parent or sitter..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-shadow font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 📋 Data Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">
              No bookings found
            </h3>
            <p className="text-slate-400 mt-2">
              Try adjusting your filters or search terms.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-8 py-5">Parent</th>
                  <th className="px-6 py-5">Sitter</th>
                  <th className="px-6 py-5">Schedule</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    {/* Parent Info */}
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-800 text-base">
                        {booking.parent.user.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {booking.parent.user.phoneNumber}
                      </div>
                    </td>

                    {/* Sitter Info */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-xs">
                          {booking.babysitter.user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">
                          {booking.babysitter.user.name}
                        </span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-5">
                      <div className="text-slate-700 font-semibold text-xs">
                        {new Date(booking.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-slate-400 text-[10px] font-medium mt-1">
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(booking.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-5 font-black text-slate-800">
                      ৳{booking.totalAmount}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      {getStatusBadge(booking.status)}
                    </td>

                    {/* 🔥 ACTIONS LOGIC FIXED HERE */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-60 lg:group-hover:opacity-100 transition-all">
                        {/* 1. Complete Button (Only if ACCEPTED) */}
                        {booking.status === "ACCEPTED" && (
                          <button
                            onClick={() =>
                              openActionModal(
                                booking.id,
                                "COMPLETED",
                                booking.parent.user.name
                              )
                            }
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
                            title="Mark as Completed"
                          >
                            <CheckSquare className="h-5 w-5" />
                          </button>
                        )}

                        {/* 2. Cancel Button (If PENDING or ACCEPTED) */}
                        {(booking.status === "PENDING" ||
                          booking.status === "ACCEPTED") && (
                          <button
                            onClick={() =>
                              openActionModal(
                                booking.id,
                                "CANCELLED",
                                booking.parent.user.name
                              )
                            }
                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                            title="Cancel Booking"
                          >
                            <XSquare className="h-5 w-5" />
                          </button>
                        )}

                        {/* 3. No Action Indicator */}
                        {(booking.status === "COMPLETED" ||
                          booking.status === "CANCELLED") && (
                          <span className="text-xs text-slate-300 font-medium italic pr-2">
                            Closed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔥 Custom Modal Integration */}
      <ConfirmActionModal
        open={modal.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
        // Dynamic Props based on Action
        type={modal.actionType === "COMPLETED" ? "approve" : "reject"}
        titleApprove="Complete Booking"
        titleReject="Cancel Booking"
        confirmTextApprove="Mark Completed"
        confirmTextReject="Confirm Cancellation"
        name={`Booking for ${modal.parentName}`}
        description={
          modal.actionType === "COMPLETED"
            ? "Are you sure this booking has been successfully completed? This will update the status and record revenue."
            : "Are you sure you want to cancel this booking? This action cannot be undone."
        }
      />
    </div>
  );
}
