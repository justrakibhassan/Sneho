"use client";

import React from "react";
import { Wrench, Clock, ShieldAlert, Sparkles, Home, Mail } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-2xl p-12 lg:p-20 rounded-[4rem] border border-white shadow-[0_32px_120px_-20px_rgba(0,0,0,0.08)] text-center space-y-12 relative">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12 animate-pulse transition-transform hover:rotate-0 duration-700">
            <Wrench className="w-12 h-12" />
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">
              Under <span className="text-blue-600">Maintenance</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
              We&apos;re currently performing some scheduled maintenance to improve your experience. We&apos;ll be back online shortly!e secure and seamless experience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-sm">
                Estimated Time
              </h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                ~2 Hours
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-sm">Data Status</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                Encrypted & Safe
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-slate-900 text-sm">Targeting</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                High Performance
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Try Refreshing
          </Link>
          <a
            href="mailto:support@sneho.com"
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" /> Contact Support
          </a>
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldAlert className="w-40 h-40 text-slate-900" />
        </div>
      </div>
    </div>
  );
}
