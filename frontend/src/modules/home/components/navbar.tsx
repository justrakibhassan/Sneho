"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Loader2, Heart } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth"; // আপনার হুক ইম্পোর্ট
import UserNav from "./user-nav";
import { useFavorites } from "@/context/favorites-context";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { favoritesCount } = useFavorites();

  const { isAuthenticated, isLoading, user } = useAuth();

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-40 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 py-1 shadow-sm"
          : "bg-transparent py-2.5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center transition-all duration-500 ${
            scrolled ? "h-12" : "h-16"
          }`}
        >
          {/* Logo Area */}
          <Link href="/" className="shrink-0 flex items-center gap-2 group">
            <div
              className={`relative transition-all duration-300 flex items-center justify-center ${
                scrolled ? "w-11 h-11" : "w-16 h-16"
              }`}
            >
              <Image
                src="/sneho_logo.png"
                alt="Sneho Logo"
                fill
                priority
                sizes="(max-width: 768px) 44px, 64px"
                className="object-contain"
              />
            </div>
            <span
              className={`font-black tracking-tighter transition-all duration-300 ${
                scrolled ? "text-xl text-teal-600" : "text-3xl text-teal-600"
              }`}
            >
              Sneho
            </span>
          </Link>

          {/* Desktop Menu */}
          <div
            className={`hidden md:flex space-x-1 items-center p-1.5 rounded-full border transition-all duration-500 ${
              scrolled
                ? "bg-slate-100/50 border-slate-200/50 backdrop-blur-md"
                : "bg-white/50 border-white/20 backdrop-blur-sm"
            }`}
          >
            {[
              { name: "Find a Sitter", href: "/find-sitter" },
              { name: "Apply as Sitter", href: "/apply" },
              { name: "Pricing", href: "/pricing" },
              { name: "How it Works", href: "/how-it-works" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  pathname === link.href
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Logic */}
          <div className="hidden md:flex items-center gap-4">
            {/* 🛠️ লোডিং অবস্থায় স্পিনার দেখাবে, তাই কোনো ফ্লিকারিং হবে না */}
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === "PARENT" && (
                  <Link
                    href="/account/favorites"
                    id="navbar-favorites-icon"
                    className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 group/fav relative"
                    title="My Favorites"
                  >
                    <Heart className="h-5 w-5 group-hover/fav:fill-rose-500 transition-colors" />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white scale-90">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                )}
                <UserNav />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-slate-600 font-bold text-sm hover:text-teal-600 px-4 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="bg-slate-900 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-teal-600 transition-colors p-2 bg-slate-50 rounded-lg"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden absolute w-full bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-2xl transition-all duration-500 ease-in-out origin-top overflow-hidden ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="px-4 pt-10 pb-8 flex flex-col items-center space-y-4">
          <Link
            href="/find-sitter"
            onClick={() => setIsOpen(false)}
            className="w-full text-center px-4 py-4 text-slate-700 font-bold text-lg hover:text-teal-600 transition-colors"
          >
            Find a Sitter
          </Link>
          <Link
            href="/apply"
            onClick={() => setIsOpen(false)}
            className="w-full text-center px-4 py-4 text-slate-700 font-bold text-lg hover:text-teal-600 transition-colors"
          >
            Apply as Sitter
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="w-full text-center px-4 py-4 text-slate-700 font-bold text-lg hover:text-teal-600 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setIsOpen(false)}
            className="w-full text-center px-4 py-4 text-slate-700 font-bold text-lg hover:text-teal-600 transition-colors"
          >
            How it Works
          </Link>

          {/* Auth Check for Mobile */}
          {!isLoading && !isAuthenticated && (
            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center px-4 py-3 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
