"use client";

import React from "react";
import { Star, Quote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const testimonials = [
  {
    name: "Sarah Ahmed",
    role: "Mother of two",
    image: "https://i.pravatar.cc/150?u=sarah",
    content:
      "Find A Babysitter has been a lifesaver! The real-time tracking gives me so much peace of mind while I'm at work. The sitters are truly professional and kind.",
    rating: 5,
  },
  {
    name: "Rahat Kabir",
    role: "Full-time Parent",
    image: "https://i.pravatar.cc/150?u=rahat",
    content:
      "The level of professionalism is unmatched. I found the perfect sitter for my daughter within an hour. The verification process is what made me choose them.",
    rating: 5,
  },
  {
    name: "Nabila Islam",
    role: "Working Professional",
    image: "https://i.pravatar.cc/150?u=nabila",
    content:
      "Excellent service! The app is very easy to use and the support team is very responsive. Highly recommend to any parent in Dhaka looking for reliable care.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100/40 rounded-full blur-[100px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/40 rounded-full blur-[100px] -ml-32 -mb-32"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">
            Parent Stories
          </h2>
          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
            Hear from Our <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-teal-500">
              Amazing Community
            </span>
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-teal-400 rounded-3xl rotate-6 animate-pulse"></div>
                  <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-14 mb-4 flex justify-center gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-orange-400 fill-current"
                  />
                ))}
              </div>

              <div className="relative px-2">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-teal-100 z-0" />
                <p className="text-slate-600 italic leading-relaxed relative z-10">
                  &quot;{testimonial.content}&quot;
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 w-full">
                <h4 className="text-lg font-black text-slate-900">
                  {testimonial.name}
                </h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-20 text-center">
          <div className="inline-block p-1 bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl">
            <div className="bg-white px-8 py-4 rounded-xl">
              <p className="text-slate-700 font-bold mb-2">
                Ready to find your perfect match?
              </p>
              <Link
                href="/find-sitter"
                className="text-teal-600 font-black flex items-center gap-2 mx-auto hover:gap-3 transition-all"
              >
                Get Started Today <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
