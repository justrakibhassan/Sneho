"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface AdminSocketContextType {
  socket: Socket | null;
  unreadCount: number;
  resetUnread: () => void;
}

const AdminSocketContext = createContext<AdminSocketContextType | undefined>(
  undefined
);

export function AdminSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "http://localhost:5000");

      newSocket.on("connect", () => {
        console.log("Admin Socket Connected");
        newSocket.emit("admin_join");
        setSocket(newSocket);
      });

      newSocket.on("admin_notification", () => {
        setUnreadCount((prev) => prev + 1);
        toast("New Support Request!", { icon: "🔔" });
      });

      newSocket.on("admin_receive_message", () => {
        setUnreadCount((prev) => prev + 1);
        toast("New Message Received!", { icon: "💬" });
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user?.role]); 

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = useMemo(() => ({
    socket,
    unreadCount,
    resetUnread
  }), [socket, unreadCount, resetUnread]);

  return (
    <AdminSocketContext.Provider value={value}>
      {children}
    </AdminSocketContext.Provider>
  );
}

export function useAdminSocket() {
  const context = useContext(AdminSocketContext);
  if (context === undefined) {
    throw new Error(
      "useAdminSocket must be used within an AdminSocketProvider"
    );
  }
  return context;
}
