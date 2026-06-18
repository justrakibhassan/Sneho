"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/context/auth-context";

/**
 * Senior Dev Solution: SessionSync
 * This component listens to route changes and periodically fetches the
 * latest user state from the server to ensure role promotions/bans are reflected
 * without requiring the user to logout and login again.
 */
export default function SessionSync() {
  const pathname = usePathname();
  const { refreshUser, isAuthenticated } = useAuthContext();

  // 1. Sync on navigation
  useEffect(() => {
    if (isAuthenticated) {
      // Small delay to ensure navigation is perceived as smooth
      const timer = setTimeout(() => {
        refreshUser();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isAuthenticated, refreshUser]);

  // 2. Periodic sync (every 5 minutes) as a fallback
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        refreshUser();
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshUser]);

  return null; // Invisible utility component
}
