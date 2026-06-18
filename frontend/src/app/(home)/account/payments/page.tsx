"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface IPayment {
  id: number;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paymentDate: string;
  booking: {
    id: number;
    parent?: { user: { name: string } };
    babysitter?: { user: { name: string } };
  };
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axiosInstance.get("/payments/history");
      if (res.data.success) {
        setPayments(res.data.data || []);
      }
    } catch {
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.booking.id.toString().includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-64 rounded-2xl" />
            <Skeleton className="h-12 w-12 rounded-2xl" />
          </div>
        </div>

        {/* Payments Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[2.5rem] p-6 border border-slate-100"
            >
              <div className="flex gap-8 items-center">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Payment History
          </h1>
          <p className="text-slate-500 font-medium">
            Track your transactions and earnings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group w-full md:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-slate-50 shadow-sm border-dashed">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
            <CreditCard size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            No Transactions Found
          </h3>
          <p className="text-slate-500 font-medium">
            You haven&apos;t made or received any payments yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="group bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    payment.amount > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {payment.amount > 0 ? <ArrowUpRight /> : <ArrowDownLeft />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-lg">
                      {payment.booking.babysitter?.user.name ||
                        payment.booking.parent?.user.name}
                    </span>
                    <span className="px-3 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Booking #{payment.booking.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-mono tracking-tighter uppercase truncate max-w-[120px]">
                      ID: {payment.transactionId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-3 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">
                      TK {payment.amount}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 text-xs font-black text-green-500 uppercase tracking-widest mt-0.5">
                      <CheckCircle2 size={12} /> {payment.status}
                    </div>
                  </div>
                  <button className="p-3 bg-slate-50 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-2xl transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
