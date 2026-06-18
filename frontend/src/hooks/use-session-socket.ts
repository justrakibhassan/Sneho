"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface UseSessionSocketProps {
  sessionId: number | null;
  userId: number;
  role: "sitter" | "parent";
}

interface SessionStatus {
  status: "NOT_STARTED" | "ACTIVE" | "PAUSED" | "COMPLETED";
  duration: number;
  pausedDuration: number;
}

export const useSessionSocket = ({
  sessionId,
  userId,
  role,
}: UseSessionSocketProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>({
    status: "NOT_STARTED",
    duration: 0,
    pausedDuration: 0,
  });

  useEffect(() => {
    // Initialize Socket.io connection (global)
    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://localhost:5000"
    );
    setSocket(newSocket); // eslint-disable-line react-hooks/set-state-in-effect

    newSocket.on("connect", () => {
      setIsConnected(true);

      // Join session room if we have an ID
      if (sessionId) {
        newSocket.emit("session:join", {
          sessionId,
          userId,
          role,
        });
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for session status updates
    newSocket.on("session:status_updated", (data) => {
      if (sessionId && data.sessionId !== sessionId) return;
      setSessionStatus((prev) => ({
        ...prev,
        status: data.status.toUpperCase(),
        duration: data.session?.totalDuration || prev.duration,
        pausedDuration: data.session?.pausedDuration || prev.pausedDuration,
      }));
    });

    // Listen for duration ticks (every 10s)
    newSocket.on("session:duration_tick", (data) => {
      if (sessionId && data.sessionId !== sessionId) return;
      setSessionStatus((prev) => ({
        ...prev,
        duration: data.duration,
      }));
    });

    // Listen for session state (full update)
    newSocket.on("session:state", (data) => {
      if (sessionId && data.session.id !== sessionId) return;
      setSessionStatus({
        status: data.session.status,
        duration: data.session.totalDuration,
        pausedDuration: data.session.pausedDuration,
      });
    });

    // Error handling
    newSocket.on("session:error", (error) => {
      console.error("Session socket error:", error);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, userId, role]);

  // Local timer to increment duration every second for smooth UI
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (sessionStatus.status === "ACTIVE") {
      interval = setInterval(() => {
        setSessionStatus((prev) => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStatus.status]);

  const pauseSession = () => {
    if (!socket || !sessionId) return;
    socket.emit("session:status_change", {
      sessionId,
      status: "paused",
      userId,
    });
  };

  const resumeSession = () => {
    if (!socket || !sessionId) return;
    socket.emit("session:status_change", {
      sessionId,
      status: "resumed",
      userId,
    });
  };

  const requestSessionState = () => {
    if (!socket || !sessionId) return;
    socket.emit("session:request_state", { sessionId });
  };

  return {
    socket,
    isConnected,
    sessionStatus,
    pauseSession,
    resumeSession,
    requestSessionState,
  };
};
