"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Heart,
  Wallet,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  X,
  ClipboardList,
  History as HistoryIcon,
  Calendar as CalendarIcon,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

const BottomNav = () => {
  const [isYouOpen, setIsYouOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    {
      name: "Message",
      href: isAuthenticated ? "/account/messages" : "/login",
      icon: MessageSquare,
    },
    // Only show Favorite for parents
    ...(user?.role === "PARENT" || !isAuthenticated
      ? [
          {
            name: "Favorite",
            href: isAuthenticated ? "/account/favorites" : "/login",
            icon: Heart,
          },
        ]
      : []),
    {
      name: user?.role === "BABYSITTER" ? "Wallet" : "Payments",
      href: isAuthenticated
        ? user?.role === "BABYSITTER"
          ? "/account/earnings"
          : "/account/payments"
        : "/login",
      icon: Wallet,
    },
  ];

  const handleToggleYou = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setIsYouOpen(!isYouOpen);
  };

  // Prevent scrolling when You menu is open
  useEffect(() => {
    if (isYouOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isYouOpen]);

  return (
    <>
      {/* Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-100 px-2 pb-safe-area-inset-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 active:scale-90 ${
                  isActive ? "text-teal-600" : "text-slate-400"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-5 w-5 ${isActive ? "fill-teal-600/10" : ""}`}
                  />
                  {item.name === "Message" && isAuthenticated && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold tracking-tight ${
                    isActive ? "text-teal-600" : ""
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* You Button */}
          <button
            onClick={handleToggleYou}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 active:scale-90 ${
              isYouOpen ||
              (isAuthenticated &&
                pathname.startsWith("/account") &&
                !navItems.some((i) => pathname === i.href))
                ? "text-teal-600"
                : "text-slate-400"
            }`}
          >
            <div
              className={`h-6 w-6 rounded-full overflow-hidden border-2 transition-colors ${
                isYouOpen ||
                (isAuthenticated && pathname.startsWith("/account"))
                  ? "border-teal-600"
                  : "border-slate-300"
              }`}
            >
              {isAuthenticated && user?.profilePicture ? (
                <div className="relative w-full h-full">
                  <Image
                    src={user.profilePicture}
                    alt="You"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <User className="h-full w-full p-0.5" />
              )}
            </div>
            <span
              className={`text-[10px] font-bold tracking-tight ${
                isYouOpen ||
                (isAuthenticated && pathname.startsWith("/account"))
                  ? "text-teal-600"
                  : ""
              }`}
            >
              {isAuthenticated ? "You" : "Sign In"}
            </span>
          </button>
        </div>
      </div>

      {/* "You" Menu Overlay/Drawer */}
      <div
        className={`md:hidden fixed inset-0 z-[60] transition-opacity duration-300 ease-in-out ${
          isYouOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
          onClick={() => setIsYouOpen(false)}
        />
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] shadow-2xl transition-transform duration-500 ${
            isYouOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ maxHeight: "85vh", overflowY: "auto" }}
        >
          {/* Handle for drawer */}
          <div className="flex justify-center pt-4 pb-2 text-slate-200">
            <div className="w-12 h-1.5 bg-current rounded-full" />
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-8 bg-slate-50 p-4 rounded-3xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white text-teal-700 font-black text-2xl overflow-hidden relative shadow-sm">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name || "User"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">
                    {user?.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">
                    {user?.email}
                  </p>
                  <div className="mt-2 inline-flex px-2 py-0.5 bg-teal-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md">
                    {user?.role}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsYouOpen(false)}
                className="p-2.5 bg-white rounded-full text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-transform"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Common Quick Links Grid */}
              <div className="grid grid-cols-3 gap-2 px-1">
                {[
                  {
                    name: "Profile",
                    href: "/account/profile",
                    icon: User,
                    color: "bg-orange-50 text-orange-600",
                  },
                  {
                    name: "Settings",
                    href: "/account/settings",
                    icon: Settings,
                    color: "bg-slate-100 text-slate-600",
                  },
                  {
                    name: "Log Out",
                    onClick: () => {
                      logout();
                      setIsYouOpen(false);
                    },
                    icon: LogOut,
                    color: "bg-rose-50 text-rose-600",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    onClick={
                      item.onClick
                        ? item.onClick
                        : () => {
                            setIsYouOpen(false);
                            window.location.href = item.href || "#";
                          }
                    }
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center shadow-sm group-active:scale-95 transition-transform`}
                    >
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Role-Specific Sections */}
              <div className="space-y-6">
                {user?.role === "PARENT" && (
                  <div className="flex flex-col items-center py-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                      Parent Controls
                    </p>
                    <div className="w-full space-y-3 px-2">
                      <Link
                        href="/account/children"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-teal-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-teal-600 shadow-sm border border-teal-50">
                          <Users className="h-5 w-5" />
                        </div>
                        <span>Children</span>
                      </Link>
                      <Link
                        href="/account/bookings"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-rose-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-600 shadow-sm border border-rose-50">
                          <HistoryIcon className="h-5 w-5" />
                        </div>
                        <span>Bookings</span>
                      </Link>
                      <Link
                        href="/account/sessions"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-orange-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm border border-orange-50">
                          <HistoryIcon className="h-5 w-5" />
                        </div>
                        <span>Sessions</span>
                      </Link>
                      <Link
                        href="/account/report"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-indigo-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span>Reports</span>
                      </Link>
                    </div>
                  </div>
                )}

                {user?.role === "BABYSITTER" && (
                  <div className="flex flex-col items-center py-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                      Sitter Controls
                    </p>
                    <div className="w-full space-y-3 px-2">
                      <Link
                        href="/account/jobs"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-indigo-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <span>Job Requests</span>
                      </Link>
                      <Link
                        href="/account/my-sessions"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-orange-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-orange-600 shadow-sm border border-orange-50">
                          <HistoryIcon className="h-5 w-5" />
                        </div>
                        <span>Sessions</span>
                      </Link>
                      <Link
                        href="/account/report"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-teal-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-teal-600 shadow-sm border border-teal-50">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span>Reports</span>
                      </Link>
                      <Link
                        href="/account/availability"
                        className="flex items-center justify-center gap-4 px-6 py-4 text-slate-700 font-bold text-sm bg-slate-50 rounded-[2rem] transition-all active:scale-[0.98] border border-slate-100 hover:bg-amber-50 group shadow-sm w-full"
                        onClick={() => setIsYouOpen(false)}
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm border border-amber-50">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <span>Availability</span>
                      </Link>
                    </div>
                  </div>
                )}

                {user?.role === "ADMIN" && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-4 mb-3">
                      Admin Access
                    </p>
                    <Link
                      href="/admin"
                      className="flex items-center gap-4 px-4 py-4 text-slate-700 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-colors active:scale-[0.98]"
                      onClick={() => setIsYouOpen(false)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <span>Admin Dashboard</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Safe space for home indicator */}
            <div className="h-12" />
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;
