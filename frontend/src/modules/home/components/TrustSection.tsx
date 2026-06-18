"use client";

import React from "react";
import { ShieldCheck, Zap, Heart, Clock, CheckCircle2 } from "lucide-react";

const trustPoints = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-teal-600" />,
    title: "Verified Professionals",
    description:
      "Every sitter undergoes a rigorous 4-step background check, including ID verification and past work history.",
    bgColor: "bg-teal-50",
  },
  {
    icon: <Zap className="w-8 h-8 text-orange-600" />,
    title: "Instant Booking",
    description:
      "Last minute plans? Find and book a trusted babysitter in less than 2 minutes through our seamless platform.",
    bgColor: "bg-orange-50",
  },
  {
    icon: <Heart className="w-8 h-8 text-red-600" />,
    title: "Premium Care",
    description:
      "Our sitters are more than just supervisors; they're expert caregivers who prioritize your child's happiness.",
    bgColor: "bg-red-50",
  },
  {
    icon: <Clock className="w-8 h-8 text-purple-600" />,
    title: "24/7 Support",
    description:
      "Our dedicated support team is available around the clock to ensure your family's experience is perfect.",
    bgColor: "bg-purple-50",
  },
];

const TrustSection = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-teal-600 uppercase tracking-widest mb-4">
            The Sneho Advantage
          </h2>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Why Parents Trust <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-teal-400">
              Find A Babysitter
            </span>
          </h3>
          <p className="mt-6 text-lg text-slate-500">
            We&apos;ve built the most reliable childcare network in Dhaka by
            focusing on safety, transparency, and expert care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className="group p-8 bg-white rounded-[2rem] border-2 border-slate-50 hover:border-teal-100 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div
                className={`w-16 h-16 ${point.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
              >
                {point.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                {point.title}
              </h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                {point.description}
              </p>

              <div className="mt-6 flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 size={14} />
                Verified Feature
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
