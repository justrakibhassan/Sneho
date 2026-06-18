"use client";

import React from "react";
import { Check, ArrowRight, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Standard",
    price: "0",
    description: "Perfect for families just getting started.",
    features: [
      "Access to verified sitters",
      "Basic matching algorithm",
      "Standard support",
      "Pay per session",
    ],
    cta: "Start for Free",
    popular: false,
    icon: Zap,
    color: "slate",
  },
  {
    name: "Premium",
    price: "999",
    period: "/mo",
    description: "Our most popular choice for busy parents.",
    features: [
      "Priority matching",
      "Advanced AI recommendations",
      "Background check reports",
      "24/7 Dedicated support",
      "No booking fees",
    ],
    cta: "Go Premium",
    popular: true,
    icon: Star,
    color: "teal",
  },
  {
    name: "Diamond",
    price: "2499",
    period: "/mo",
    description: "Complete peace of mind for your family.",
    features: [
      "Everything in Premium",
      "Elite & background-verified sitters",
      "Emergency backup care",
      "Personalized family advisor",
      "Identity protection for sitters",
    ],
    cta: "Join Diamond",
    popular: false,
    icon: Sparkles,
    color: "indigo",
  },
];

const faqs = [
  {
    q: "How does the matching work?",
    a: "Our Smart Match algorithm uses personality traits, availability, and specific needs to find the perfect caregivers for your family.",
  },
  {
    q: "Are the sitters verified?",
    a: "Yes! Every caregiver on Sneho undergoes a strict verification process, and Premium/Diamond members get access to full background reports.",
  },
  {
    q: "Can I cancel my subscription any time?",
    a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time through your account settings.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ShieldCheck className="w-4 h-4" /> Trusted by 10,000+ Families
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
            Simple, Transparent <br />
            <span className="text-teal-600">Pricing Plans</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Choose the best plan for your family&apos;s needs. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-10 rounded-[3rem] transition-all duration-500 hover:-translate-y-2 ${
                plan.popular
                  ? "bg-slate-900 text-white shadow-2xl shadow-teal-900/20 ring-4 ring-teal-500/10"
                  : "bg-white border border-slate-100 shadow-xl shadow-slate-200/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-teal-500 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8 flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${plan.popular ? "bg-teal-500/10 text-teal-400" : "bg-slate-50 text-slate-600"}`}>
                  <plan.icon className="w-8 h-8" />
                </div>
              </div>

              <div className="mb-8">
                <h3 className={`text-2xl font-black mb-2 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm font-medium ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className={`text-5xl font-black ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  ৳{plan.price}
                </span>
                <span className={`text-sm font-bold ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.period || "/one-time"}
                </span>
              </div>

              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 items-center text-sm font-semibold">
                    <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? "bg-teal-500/20 text-teal-400" : "bg-teal-50 text-teal-600"}`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className={plan.popular ? "text-slate-300" : "text-slate-600"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 group ${
                  plan.popular
                    ? "bg-teal-500 hover:bg-teal-600 text-white shadow-xl shadow-teal-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10"
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <h4 className="text-lg font-black text-slate-900 leading-tight">{faq.q}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
