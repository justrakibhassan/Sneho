"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { Send, User, MessageSquare, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface IMessage {
  sender: "user" | "bot" | "agent";
  message: string;
  timestamp: Date;
}

interface IActiveChat {
  userId: string;
  messages: IMessage[];
  unread: number;
}

export default function AdminSupportPage() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeChats, setActiveChats] = useState<IActiveChat[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleIncomingMessage = useCallback((
    userId: string,
    message: string,
    sender: "user"
  ) => {
    setActiveChats((prev) => {
      const existingChat = prev.find((c) => c.userId === userId);
      if (existingChat) {
        return prev.map((c) =>
          c.userId === userId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  { sender, message, timestamp: new Date() },
                ],
                unread: selectedUserId === userId ? 0 : c.unread + 1,
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            userId,
            messages: [{ sender, message, timestamp: new Date() }],
            unread: 1,
          },
        ];
      }
    });
  }, [selectedUserId]);

  // Initialize Socket
  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      const newSocket = io(
        process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
          "http://localhost:5000"
      );
      setSocket(newSocket); // eslint-disable-line react-hooks/set-state-in-effect

      newSocket.on("connect", () => {
        newSocket.emit("admin_join");
      });

      // New support request or message forwarded to admin
      newSocket.on(
        "admin_notification",
        (data: { userId: string; message: string }) => {
          handleIncomingMessage(data.userId, data.message, "user");
        }
      );

      newSocket.on(
        "admin_receive_message",
        (data: { userId: string; message: string }) => {
          handleIncomingMessage(data.userId, data.message, "user");
        }
      );

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, handleIncomingMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChats, selectedUserId]);

  const handleSendMessage = () => {
    if (!input.trim() || !socket || !selectedUserId) return;

    const adminMessage: IMessage = {
      sender: "agent",
      message: input,
      timestamp: new Date(),
    };

    // Update local state
    setActiveChats((prev) =>
      prev.map((c) =>
        c.userId === selectedUserId
          ? {
              ...c,
              messages: [...c.messages, adminMessage],
            }
          : c
      )
    );

    // Emit to user
    socket.emit("admin_reply", { userId: selectedUserId, message: input });
    setInput("");
  };

  const selectedChat = activeChats.find((c) => c.userId === selectedUserId);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <div className="p-10 text-center">Access Denied. Admins only.</div>;
  }

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50 overflow-hidden">
      {/* Sidebar: Active Chats */}
      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-700 flex items-center gap-2">
            <MessageSquare className="text-teal-600" /> Support Requests
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeChats.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <AlertCircle className="mx-auto mb-2 opacity-50" />
              <p>No active support requests</p>
            </div>
          )}
          {activeChats.map((chat) => (
            <button
              key={chat.userId}
              onClick={() => setSelectedUserId(chat.userId)}
              className={`w-full p-4 text-left border-b border-slate-50 transition hover:bg-slate-50 flex justify-between items-center ${
                selectedUserId === chat.userId
                  ? "bg-teal-50 border-l-4 border-l-teal-500"
                  : ""
              }`}
            >
              <div>
                <p className="font-bold text-slate-700 flex items-center gap-2">
                  <User size={16} /> User {chat.userId.slice(0, 5)}...
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {chat.messages[chat.messages.length - 1].message}
                </p>
              </div>
              {chat.unread > 0 && selectedUserId !== chat.userId && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  {chat.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-100">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex justify-between items-center">
              <h3 className="font-bold text-slate-700">
                Chatting with User: {selectedChat.userId}
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold uppercase">
                Live
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "agent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                      msg.sender === "agent"
                        ? "bg-teal-600 text-white rounded-br-none"
                        : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        msg.sender === "agent"
                          ? "text-teal-200"
                          : "text-slate-400"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your reply..."
                  className="flex-1 bg-slate-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="bg-teal-600 text-white p-3 rounded-full hover:bg-teal-700 transition shadow-md disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <p>Select a chat to start replying</p>
          </div>
        )}
      </div>
    </div>
  );
}
