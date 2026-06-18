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
  Settings,
  MessageCircle,
  MapPin,
  ClipboardList,
} from "lucide-react";

export function MobileAccountNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const commonItems = [
    { label: "Overview", href: "/account", icon: LayoutDashboard },
    { label: "Profile", href: "/account/profile", icon: User },
    { label: "Messages", href: "/account/messages", icon: MessageCircle },
  ];

  const parentItems = [
    { label: "Children", href: "/account/children", icon: Baby },
    { label: "Find Sitter", href: "/find-sitter", icon: Search },
    { label: "Bookings", href: "/account/bookings", icon: Calendar },
    { label: "Sessions", href: "/account/sessions", icon: MapPin },
  ];

  const sitterItems = [
    { label: "Jobs", href: "/account/jobs", icon: Calendar },
    { label: "Sessions", href: "/account/my-sessions", icon: MapPin },
    { label: "Availability", href: "/account/availability", icon: Clock },
    { label: "Earnings", href: "/account/earnings", icon: Wallet },
    { label: "Reports", href: "/account/report", icon: ClipboardList },
  ];

  const mainItems =
    user?.role === "PARENT"
      ? [...commonItems, ...parentItems]
      : user?.role === "BABYSITTER"
      ? [...commonItems, ...sitterItems]
      : commonItems;

  return (
    <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 pb-2">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-200"
                  : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/account/settings"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
            pathname === "/account/settings"
              ? "bg-teal-600 text-white shadow-lg shadow-teal-200"
              : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
          }`}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </div>
  );
}
