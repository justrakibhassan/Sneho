"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  History,
  Loader2,
  DollarSign,
  User,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface Transaction {
  id: number;
  amount: number | string;
  date: string;
  parentName: string;
  parentAvatar?: string;
  status: string;
  tip?: number;
  baseAmount?: number;
}

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  transactions: Transaction[];
}

export default function EarningsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EarningsData | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await axiosInstance.get("/bookings/earnings");
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error("Fetch Earnings Error:", error);
        toast.error("Failed to load earnings data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEarnings();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
        <p className="text-slate-500 font-medium">Crunching your earnings...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-teal-600" /> My Wallet
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage your earnings, tips, and payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm">
            Download Report
          </button>
          <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-teal-600 transition-all text-sm shadow-xl shadow-slate-900/10">
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Total Earnings Card */}
        <div className="relative group overflow-hidden bg-linear-to-br from-teal-600 to-teal-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-teal-900/20 transition-all hover:scale-[1.02]">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-6">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-teal-100 font-bold uppercase tracking-widest text-[10px]">
                  Net Income
                </p>
                <h2 className="text-5xl font-black tracking-tight">
                  TK {data.totalEarnings.toLocaleString()}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md">
                <TrendingUp className="w-3.5 h-3.5" /> +12% this month
              </span>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
        </div>

        {/* Current Month Card */}
        <div className="relative group overflow-hidden bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-100 transition-all hover:scale-[1.02]">
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-6">
              <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-orange-600" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Current Month
                </p>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">
                  TK {data.monthlyEarnings.toLocaleString()}
                </h2>
              </div>
            </div>
            <Link
              href="/account/jobs"
              className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all group/btn"
            >
              <ArrowUpRight className="w-6 h-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </Link>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-50 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                Transaction History
              </h3>
              <p className="text-sm text-slate-400 font-medium tracking-tight">
                Recent payments from parents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-teal-500 outline-none">
              <option>All Payments</option>
              <option>This Month</option>
              <option>Last 3 Months</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Parent
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Amount
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Date
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-10 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.transactions.length > 0 ? (
                data.transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-white shadow-sm shrink-0">
                          {tx.parentAvatar ? (
                            <Image
                              src={tx.parentAvatar}
                              alt={tx.parentName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                              {tx.parentName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          {tx.parentName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900">
                          TK {Number(tx.amount).toLocaleString()}
                        </span>
                        {tx.tip && tx.tip > 0 && (
                          <span className="text-[10px] font-black text-teal-600 uppercase tracking-tight">
                            Incl. TK {tx.tip} tip ✨
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-slate-500 font-medium">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-6">
                      <span
                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          tx.status === "COMPLETED"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-amber-50 text-amber-700 border-amber-100"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all transform hover:scale-110">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold">
                        No earnings recorded yet.
                      </p>
                      <Link
                        href="/account/jobs"
                        className="text-teal-600 font-black text-sm hover:underline"
                      >
                        Go find some jobs →
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
