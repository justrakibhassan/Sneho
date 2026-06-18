"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import NextImage from "next/image";

export default function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const toggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 p-1 pl-3 pr-1 md:pl-2 md:pr-3 rounded-full border border-slate-200 md:hover:shadow-md transition-all duration-200 group bg-white cursor-default md:cursor-pointer flex-row-reverse md:flex-row"
      >
        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-teal-100 flex items-center justify-center border border-teal-200 text-teal-700 font-bold shadow-sm overflow-hidden relative">
          {user?.profilePicture ? (
            <NextImage
              src={user.profilePicture}
              alt={user.name || "User"}
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <span className="text-xs md:text-sm font-bold text-slate-700 max-w-[80px] md:max-w-[100px] truncate">
          {user?.name?.split(" ")[0]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 hidden md:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-50 mb-1">
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-teal-100">
              {user?.role}
            </span>
          </div>

          <div className="space-y-1 mt-1">
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4 text-slate-400" />
              Dashboard
            </Link>
            <Link
              href="/account/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>
          </div>

          <div className="border-t border-slate-50 my-1"></div>

          <button
            onClick={logout} // হুকের লগআউট ফাংশন ব্যবহার করুন
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
