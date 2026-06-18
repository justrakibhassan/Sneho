"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Star, HeartHandshake, ArrowRight } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden bg-white">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-50/60 rounded-full blur-[120px] -mr-64 -mt-32 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-[100px] -ml-48 -mb-32"></div>

      {/* Decorative Dots */}
      <div className="absolute top-1/4 right-10 opacity-20 hidden lg:block">
        <div className="grid grid-cols-6 gap-3">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
          {/* Left Content: High-End Typography & Value Prop */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-teal-50 border border-teal-100/50 shadow-sm animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </div>
              <span className="text-sm font-bold text-teal-700 tracking-wide uppercase">
                #1 Trusted Care Network in BD
              </span>
            </div>

            <h1 className="text-4xl xs:text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
              Premium Care for <br className="hidden lg:block" />
              <span className="relative inline-block mt-2">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-teal-400">
                  Your Little Ones
                </span>
                <div className="absolute -bottom-2 left-0 w-full h-2 bg-teal-100/40 -z-10 rounded-full"></div>
              </span>
            </h1>

            <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Connect with background-checked, expert babysitters curated for
              your family&apos;s unique needs. Pure peace of mind, just a click
              away.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link
                href="/find-sitter"
                className="group relative px-10 py-5 bg-slate-900 text-white font-bold rounded-2xl shadow-2xl shadow-slate-900/20 hover:shadow-teal-600/20 hover:bg-teal-600 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Find a Babysitter{" "}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/apply"
                className="px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 hover:border-teal-600 hover:text-teal-600 font-bold rounded-2xl transition-all duration-300 flex items-center justify-center"
              >
                Apply as Sitter
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="flex items-center justify-center lg:justify-start gap-10 pt-6 animate-in fade-in duration-1000 delay-500">
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900">4.9/5</p>
                <div className="flex gap-1 text-orange-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Parent Rating
                </p>
              </div>
              <div className="w-px h-12 bg-slate-100"></div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900">2,000+</p>
                <div className="flex items-center gap-1.5 text-teal-600 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Expert Sitters
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual: Premium Composition */}
          <div className="relative lg:ml-10">
            {/* Main Image Wrapper */}
            <div className="relative z-20 rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-8 lg:border-12 border-white animate-in zoom-in duration-1000">
              <Image
                src="/hero-babysitter.png"
                alt="Professional Babysitter with Happy Children"
                width={800}
                height={650}
                priority
                className="w-full h-[400px] xs:h-[500px] lg:h-[650px] object-cover hover:scale-105 transition-transform duration-1000"
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/20 to-transparent"></div>
            </div>

            {/* Glassmorphic Floating Cards */}
            <div className="absolute -top-10 -left-10 z-30 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 animate-bounce-slow hidden xl:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Success Rate
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    99.2% Happy Kids
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 -right-8 z-30 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/50 animate-float hidden xl:block">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="relative w-10 h-10 rounded-full border-4 border-white bg-slate-200 overflow-hidden"
                    >
                      <Image
                        src={`https://i.pravatar.cc/100?u=${i}`}
                        alt="user"
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">
                    Join Others
                  </p>
                  <p className="text-lg font-black text-slate-900">
                    12k+ Parents Trust Us
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative background shape */}
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-600/10 rounded-full -z-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
