"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden selection:bg-teal-100 selection:text-teal-900">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/60 rounded-full blur-[120px] -mr-64 -mt-32 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[100px] -ml-48 -mb-32" />

      {/* Decorative Dots */}
      <div className="absolute top-1/4 right-10 opacity-20 hidden lg:block">
        <div className="grid grid-cols-6 gap-3">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center">
        {/* Illustration Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="relative w-full max-w-[400px] aspect-square mx-auto">
            <Image
              src="/images/404-illustration.png"
              alt="404 Illustration"
              fill
              priority
              className="object-contain animate-float"
            />
          </div>

          {/* Subtle Glow behind the illustration */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-200/30 blur-[80px] rounded-full -z-10" />
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h1 className="text-4xl xs:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Oops! Page <br className="hidden xs:block" />
              <span className="relative inline-block mt-2">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-teal-400">
                  Not Found
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-teal-100/40 -z-10 rounded-full" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed">
              It seems like the page you&apos;re looking for has wandered off.
              Don&apos;t worry, even the best of us get lost sometimes!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/"
              className="w-full sm:w-auto group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-2xl shadow-slate-900/20 hover:shadow-teal-600/20 hover:bg-teal-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 hover:border-teal-600 hover:text-teal-600 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>

        {/* Secondary Navigation (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 flex items-center justify-center gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest"
        >
          <Link
            href="/find-sitter"
            className="hover:text-teal-600 transition-colors"
          >
            Find Sitter
          </Link>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <Link href="/about" className="hover:text-teal-600 transition-colors">
            About Us
          </Link>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          <Link
            href="/contact"
            className="hover:text-teal-600 transition-colors"
          >
            Contact
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
