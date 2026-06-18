"use client";

import React from "react";
import {
  Bell,
  Search,
  Settings,
  ChevronDown,
  BadgeCheck,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdminSocket } from "@/context/admin-socket-context";

export default function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { unreadCount } = useAdminSocket();

  // Logout Function
  const handleLogout = () => {
    toast.success("Logged out successfully");
    logout(); // Use auth context's logout function
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:bg-slate-100 mr-2"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* 1. Left: Page Title */}
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
      </div>

      {/* 2. Middle: Search Bar */}
      <div className="flex-1 max-w-md mx-4 md:mx-12 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search users, bookings..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        />
      </div>

      {/* 3. Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-500 hover:bg-slate-100 relative"
          >
            <Bell className="h-5 w-5" />
            {/* Badge */}
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            )}
          </Button>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
              {/* Avatar with Verified Badge */}
              <div className="relative">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-200 overflow-hidden">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt="Admin"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || "A"
                  )}
                </div>

                {/* 👇 Verified Badge Icon Fixed */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                  <BadgeCheck className="w-4 h-4 text-white fill-blue-500" />
                </div>
              </div>

              {/* User Info (Name & Email) */}
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-700 leading-none group-hover:text-teal-700 transition-colors">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-[150px]">
                  {user?.email || "admin@example.com"}
                </p>
              </div>

              {/* Dropdown Chevron Icon */}
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors hidden md:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/admin/settings")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
