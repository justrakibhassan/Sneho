// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ✅ 1. User Definition
export interface IUser {
  id: number;
  name: string;
  email: string;
  role: "PARENT" | "BABYSITTER" | "ADMIN" | "USER";
  phoneNumber?: string;
  profilePicture?: string | null;
  parent?: {
    id: number;
    locationAddress: string | null;
    minBudget: number | null;
    maxBudget: number | null;
    preferences: string | null;
    requiredDays: string | null;
  } | null;
  babysitter?: {
    id: number;
    locationAddress: string | null;
    hourlyRate: number;
    experienceYears: number;
    bio: string | null;
    skills: string | null;
  } | null;
}

// ✅ 2. Context Interface
interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: IUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // ✅ 3. Load User on Mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          setUser(JSON.parse(storedUser) as IUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        localStorage.clear();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ✅ 4. Login Action (Updates State + LocalStorage + Cookies)
  const login = (token: string, userData: IUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    // Set cookie for middleware - expires in 7 days
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    setUser(userData); // 🔥 State update triggers re-render everywhere
  };

  // ✅ 5. Refresh User Action (Fetch latest from server)
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const { default: proxy } = await import("@/lib/proxy");
      const res = await proxy.get("/user/profile");

      if (res.data.success) {
        const updatedUser: IUser = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          phoneNumber: res.data.user.phoneNumber,
          profilePicture: res.data.user.profilePicture,
          parent: res.data.user.parent || null,
          babysitter: res.data.user.babysitter || null,
        };

        // Only update if data changed to prevent cycles
        const currentStored = localStorage.getItem("user");
        if (JSON.stringify(updatedUser) !== currentStored) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
          // Ensure token cookie is present if we have a token
          document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  // ✅ 6. Logout Action
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Clear cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Internal hook (Optional, but good practice)
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
