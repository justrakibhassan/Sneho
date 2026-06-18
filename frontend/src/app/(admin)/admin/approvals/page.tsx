"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Booking {
  id: number;
  status: string;
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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
            Pending
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            Accepted
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6 p-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Booking Management
        </h1>
        <p className="text-slate-500">Monitor all booking activities.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {bookings.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Parent (Client)</th>
                  <th className="px-6 py-4">Sitter (Provider)</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    {/* Parent Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        {booking.parent.user.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {booking.parent.user.phoneNumber}
                      </div>
                    </td>

                    {/* Sitter Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-teal-600" />
                        <span className="font-medium">
                          {booking.babysitter.user.name}
                        </span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-slate-600">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(booking.startTime).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(booking.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -
                          {new Date(booking.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 flex items-center">
                        <DollarSign className="h-3.5 w-3.5" />{" "}
                        {booking.totalAmount}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
