"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils"; // Shadcn utility
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  CalendarDays,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminSocket } from "@/context/admin-socket-context";
import { useAuth } from "@/hooks/use-auth";

interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (value: boolean) => void;
}

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { unreadCount } = useAdminSocket();
  const { logout } = useAuth();

  // Navigation Items
  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    {
      label: "Live Chat",
      href: "/admin/live-chat",
      icon: MessageSquare,
      badge: unreadCount,
    },
    { label: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
    { label: "Sitters", href: "/admin/sitters/pending", icon: Users },
    { label: "All Users", href: "/admin/users", icon: Users },
    { label: "Bookings", href: "/admin/bookings", icon: CalendarDays },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  // Logout Handler
  const handleLogout = () => {
    toast.success("Logged out");
    logout(); // Use auth context's logout function
  };

  return (
    <aside
      className={cn(
        "fixed lg:relative flex flex-col h-screen bg-slate-950 text-slate-100 border-r border-slate-800 transition-all duration-300 ease-in-out z-50",
        isCollapsed ? "w-[80px]" : "w-72",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* 🟢 Header / Logo */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800 relative">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 animate-in fade-in duration-300">
            <div className="relative w-10 h-10">
              <Image
                src="/sneho_logo.png"
                alt="Sneho Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Sneho
            </h1>
          </div>
        ) : (
          <div className="relative w-10 h-10">
            <Image
              src="/sneho_logo.png"
              alt="Sneho Logo"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
        )}

        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen?.(false)}
          className="absolute right-2 top-6 text-slate-400 hover:text-white lg:hidden"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Collapse Toggle Button (Absolute) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 w-6 h-6 rounded-full bg-teal-600 text-white hover:bg-teal-500 shadow-md border border-slate-900 z-50 hidden lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* 🟢 Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return isCollapsed ? (
              // Collapsed Mode (Only Icons with Tooltip)
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center h-12 w-12 rounded-xl transition-all mx-auto relative",
                      isActive
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-slate-800 text-white border-slate-700"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              // Expanded Mode (Icon + Text)
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm relative",
                  isActive
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </TooltipProvider>
      </div>

      {/* 🟢 Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-12 w-12 rounded-xl mx-auto flex items-center justify-center text-red-400 hover:bg-red-950/30 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-red-900 text-white border-red-800"
              >
                Logout
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-red-400 hover:bg-red-950/30 hover:text-red-300 px-4 py-6 rounded-xl"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
