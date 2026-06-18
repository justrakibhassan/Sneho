"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/modules/admin/admin-sidebar";
import AdminHeader from "@/modules/admin/admin-header";
import { AdminSocketProvider } from "@/context/admin-socket-context";
import { useAuthContext } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login?callbackUrl=/admin");
      } else if (user?.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Prevent flicker: show nothing or a skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 w-full max-w-md p-8">
          <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 mx-auto rounded-lg" />
        </div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render children while redirecting
  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <AdminSocketProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <AdminSidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
          {/* 🟢 Top Header */}
          <AdminHeader onMenuClick={() => setIsMobileOpen(true)} />

          {/* Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-6 md:p-8">
            <div
              className={cn(
                "w-full transition-all duration-300",
                isCollapsed ? "px-4" : "px-0"
              )}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminSocketProvider>
  );
}
