"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  User,
  Calendar,
  Baby,
  Search,
  Clock,
  Wallet,
  FileBadge,
  Settings,
  LogOut,
  HelpCircle,
  ChevronRight,
  MessageCircle,
  MapPin,
  ClipboardList,
  CreditCard,
  Heart,
} from "lucide-react";

export function AccountSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // 1. Menu Items Definition
  const commonItems = [
    { label: "Overview", href: "/account", icon: LayoutDashboard },
    { label: "My Profile", href: "/account/profile", icon: User },
    { label: "Messages", href: "/account/messages", icon: MessageCircle },
    { label: "Payments", href: "/account/payments", icon: CreditCard },
  ];

  const parentItems = [
    { label: "My Children", href: "/account/children", icon: Baby },
    { label: "Find Sitter", href: "/find-sitter", icon: Search },
    { label: "Bookings", href: "/account/bookings", icon: Calendar },
    { label: "Favorites", href: "/account/favorites", icon: Heart },
    { label: "Live Sessions", href: "/account/sessions", icon: MapPin },
    { label: "Daily Reports", href: "/account/report", icon: ClipboardList },
  ];

  const sitterItems = [
    { label: "Job Requests", href: "/account/jobs", icon: Calendar },
    { label: "My Sessions", href: "/account/my-sessions", icon: MapPin },
    { label: "Availability", href: "/account/availability", icon: Clock },
    { label: "My Wallet", href: "/account/earnings", icon: Wallet },
    {
      label: "Certifications",
      href: "/account/certifications",
      icon: FileBadge,
    },
    { label: "Daily Reports", href: "/account/report", icon: ClipboardList },
  ];

  const settingItems = [
    { label: "Settings", href: "/account/settings", icon: Settings },
  ];

  // 2. Decide Logic
  const mainItems =
    user?.role === "PARENT"
      ? [...commonItems, ...parentItems]
      : user?.role === "BABYSITTER"
      ? [...commonItems, ...sitterItems]
      : commonItems;

  return (
    // ✨ CHANGE 1: Sticky & Floating Card Design
    // এটি স্ক্রিনের সাথে লেগে থাকবে না, বরং ভাসমান কার্ডের মতো দেখাবে
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Navigation Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Menu Header */}
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Main Menu
            </h3>
          </div>

          <div className="p-3 space-y-1">
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive
                          ? "text-teal-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    {item.label}
                  </div>
                  {/* Active Indicator Icon */}
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-teal-500" />
                  )}
                </Link>
              );
            })}

            {/* Separator */}
            <div className="my-2 border-t border-slate-50"></div>

            {/* Settings & Logout */}
            {settingItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  pathname === item.href
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <item.icon className="h-5 w-5 text-slate-400" />
                {item.label}
              </Link>
            ))}

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="h-5 w-5" /> Log Out
            </button>
          </div>
        </div>

        {/* Support Card (UI Friendly Addition) */}
        <div className="bg-linear-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-bold text-sm">Need Help?</h4>
            <p className="text-xs text-teal-100 mt-1 mb-3 leading-relaxed">
              Check our support docs or contact support for queries.
            </p>
            <button className="text-xs font-bold bg-white text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-50 transition">
              Contact Support
            </button>
          </div>
          {/* Decoration Circles */}
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </div>
    </aside>
  );
}
