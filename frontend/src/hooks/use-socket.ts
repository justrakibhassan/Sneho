"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

export const useSocket = (room?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL);

    socketInstance.on("connect", () => {
      setIsConnected(true);
      setSocket(socketInstance); // Call it inside a callback or let it be
      if (room) {
        socketInstance.emit("admin_join");
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [room]);

  return { socket, isConnected };
};
