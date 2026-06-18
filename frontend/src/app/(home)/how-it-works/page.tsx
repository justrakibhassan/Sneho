"use client";

import React, { useState } from "react";
import {
  Search,
  Calendar,
  ShieldCheck,
  Star,
  UserPlus,
  ClipboardCheck,
  Clock,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Heart,
  Shield,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<"parent" | "sitter">("parent");

  const parentSteps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Find Your Match",
      description:
        "Search for qualified babysitters in your local area. Filters help you find the perfect match for your family's unique needs.",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Book with Ease",
      description:
        "Check sitter availability in real-time. Schedule one-time sessions or recurring care with just a few clicks.",
      color: "bg-teal-500",
      lightColor: "bg-teal-50",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Safe Payments",
      description:
        "Our platform ensures secure, hassle-free payments. Pay only after the session is completed and you're satisfied.",
      color: "bg-green-600",
      lightColor: "bg-green-50",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Rate & Review",
      description:
        "After the session, share your experience by rating your sitter. This helps maintain our community's high standards.",
      color: "bg-emerald-400",
      lightColor: "bg-emerald-50",
    },
  ];

  const sitterSteps = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Create Your Profile",
      description:
        "Build a professional profile highlighting your experience, skills, and certifications to attract top families.",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
    },
    {
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Get Verified",
      description:
        "Submit for background checks and identity verification. A 'Verified' badge increases your booking rate significantly.",
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Manage Schedule",
      description:
        "Set your own availability and rates. You have total control over when and where you want to work.",
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Earn Securely",
      description:
        "Receive payments directly to your account. We handle all the billing so you can focus on providing great care.",
      color: "bg-sky-500",
      lightColor: "bg-sky-50",
    },
  ];

  const currentSteps = activeTab === "parent" ? parentSteps : sitterSteps;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100 rounded-full blur-[120px] -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full blur-[100px] -ml-20 -mb-20" />
        </div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-bold text-xs uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4" /> Your Journey Starts Here
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-700">
            Simplifying Care for <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">
              Modern Families
            </span>
          </h1>

          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900">
            Sneho brings parents and professional sitters together through a
            seamless, secure, and transparent platform.
          </p>
        </div>
      </section>

      {/* 2. Interactive Switcher */}
      <section className="pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto p-1.5 bg-slate-100 rounded-3xl flex items-center relative shadow-inner">
            <button
              onClick={() => setActiveTab("parent")}
              className={`flex-1 py-4 px-6 rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all relative z-10 ${
                activeTab === "parent"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              For Parents
            </button>
            <button
              onClick={() => setActiveTab("sitter")}
              className={`flex-1 py-4 px-6 rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all relative z-10 ${
                activeTab === "sitter"
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              For Sitters
            </button>

            {/* Animated Slider Background */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-[1.25rem] transition-all duration-500 shadow-xl ${
                activeTab === "parent"
                  ? "left-1.5 bg-emerald-600 shadow-emerald-200"
                  : "left-[calc(50%+1.5px)] bg-blue-600 shadow-blue-200"
              }`}
            />
          </div>
        </div>
      </section>

      {/* 3. Process Steps */}
      <section className="py-20 relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-[60px] left-20 right-20 h-0.5 border-t-2 border-dashed border-slate-200 -z-10" />

            {currentSteps.map((step, index) => (
              <div key={index} className="group relative">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Step Number Circle */}
                  <div
                    className={`w-28 h-28 rounded-3xl ${step.lightColor} border-2 border-white shadow-xl flex items-center justify-center relative transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105 group-hover:rotate-3`}
                  >
                    <div
                      className={`absolute -top-3 -right-3 w-10 h-10 rounded-2xl ${step.color} text-white font-black flex items-center justify-center shadow-lg`}
                    >
                      {index + 1}
                    </div>
                    <div
                      className={`text-${activeTab === "parent" ? "emerald" : "blue"}-600`}
                    >
                      {step.icon}
                    </div>
                  </div>

                  <div className="space-y-3 px-4">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Trust & Safety Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Your safety is our <br />
                  <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">
                    top priority.
                  </span>
                </h2>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                  We&apos;ve built a multi-layered safety system to ensure every
                  interaction on Sneho is safe, respectful, and reliable.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900">Vetted Sitters</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    Every sitter undergoes identity verification and manual
                    review.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900">Instant Support</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    Our support team is available 24/7 to assist with any
                    concerns.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900">Community Trust</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    Transparent reviews and ratings build a reliable community.
                  </p>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-slate-900">Smart Matching</h4>
                  <p className="text-sm text-slate-500 font-medium">
                    Our AI finds the best sitter based on your specific
                    requirements.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-4 bg-linear-to-tr from-emerald-100 to-blue-100 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative aspect-square bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl flex flex-col justify-center space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">
                        Sneho Shield
                      </h3>
                      <p className="text-slate-500 font-medium text-sm">
                        Comprehensive protection for every session.
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {[
                      "Identity verification for all users",
                      "Secure escrow-based payment system",
                      "Direct messaging with file sharing",
                      "GPS-tracked check-ins/check-outs",
                      "Instant emergency alerts",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-4 items-center text-slate-600 font-bold"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    Learn about Safety <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-emerald-600 rounded-[3.5rem] p-12 lg:p-24 overflow-hidden shadow-2xl shadow-emerald-200">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="10 5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                />
              </svg>
            </div>

            <div className="relative max-w-3xl mx-auto text-center space-y-10">
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                Ready to find the perfect <br className="hidden md:block" />{" "}
                sitter today?
              </h2>
              <p className="text-xl text-emerald-50 font-medium opacity-90 leading-relaxed">
                Join our growing community today. Whether you&apos;re looking
                for a sitter or looking to babysit, we&apos;ve got you
                covered.aily care, specialized needs, and everything in between.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                  href="/find-sitter"
                  className="w-full sm:w-auto px-10 py-6 bg-white text-emerald-600 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3 active:scale-95"
                >
                  Find a Sitter <Search className="w-4 h-4" />
                </Link>
                <Link
                  href="/apply"
                  className="w-full sm:w-auto px-10 py-6 bg-emerald-500 text-white border-2 border-emerald-400 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Join as Sitter <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
