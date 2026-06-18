"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  MessageSquare,
  Search,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAdminSocket } from "@/context/admin-socket-context";

interface IMessage {
  sender: "user" | "bot" | "agent";
  message: string;
  timestamp: Date;
}

interface IActiveChat {
  userId: string;
  userName: string;
  messages: IMessage[];
  unread: number;
  status: "active" | "waiting" | "closed";
}

export default function AdminLiveChatPage() {
  const { user, isAuthenticated } = useAuth();
  const { socket, resetUnread } = useAdminSocket(); // Use global socket
  const [activeChats, setActiveChats] = useState<IActiveChat[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_active_chats");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load chat history:", e);
        }
      }
    }
    return [];
  });
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    if (activeChats.length > 0) {
      localStorage.setItem("admin_active_chats", JSON.stringify(activeChats));
    }
  }, [activeChats]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: {
      userId: string;
      userName?: string;
      message: string;
    }) => {
      setActiveChats((prev) => {
        const existingChat = prev.find((c) => c.userId === data.userId);
        if (existingChat) {
          return prev.map((c) =>
            c.userId === data.userId
              ? {
                  ...c,
                  userName: data.userName || c.userName, // Update if provided
                  messages: [
                    ...c.messages,
                    {
                      sender: "user" as const,
                      message: data.message,
                      timestamp: new Date(),
                    },
                  ],
                  unread: selectedUserId === data.userId ? 0 : c.unread + 1,
                  status: "active" as const,
                }
              : c
          );
        } else {
          return [
            ...prev,
            {
              userId: data.userId,
              userName: data.userName || "Anonymous User",
              messages: [
                {
                  sender: "user" as const,
                  message: data.message,
                  timestamp: new Date(),
                },
              ],
              unread: 1,
              status: "waiting" as const,
            },
          ];
        }
      });
    };

    socket.on("admin_notification", handleMessage);
    socket.on("admin_receive_message", handleMessage);

    return () => {
      socket.off("admin_notification", handleMessage);
      socket.off("admin_receive_message", handleMessage);
    };
  }, [socket, selectedUserId]);

  // Reset unread count when viewing this page
  useEffect(() => {
    resetUnread();
  }, [resetUnread]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChats, selectedUserId]);

  // Mark chat as read when selected is handled in onClick

  const handleSendMessage = () => {
    if (!input.trim() || !socket || !selectedUserId) return;

    const adminMessage: IMessage = {
      sender: "agent",
      message: input,
      timestamp: new Date(),
    };

    setActiveChats((prev) =>
      prev.map((c) =>
        c.userId === selectedUserId
          ? {
              ...c,
              messages: [...c.messages, adminMessage],
              status: "active",
            }
          : c
      )
    );

    socket.emit("admin_reply", { userId: selectedUserId, message: input });
    setInput("");
  };

  const clearAllChats = () => {
    setActiveChats([]);
    setSelectedUserId(null);
    localStorage.removeItem("admin_active_chats");
  };

  const selectedChat = activeChats.find((c) => c.userId === selectedUserId);

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 text-slate-500">
        Access Restricted
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Sidebar - Chat List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-bold text-xl text-slate-800">Live Support</h1>
            {activeChats.length > 0 && (
              <button
                onClick={() => setShowClearModal(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeChats.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-6 text-center">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p className="text-sm">No active conversations.</p>
              <p className="text-xs mt-2">
                New requests will appear here instantly.
              </p>
            </div>
          )}

          {activeChats.map((chat) => (
            <div
              key={chat.userId}
              onClick={() => {
                setSelectedUserId(chat.userId);
                setActiveChats((prev) =>
                  prev.map((c) => (c.userId === chat.userId ? { ...c, unread: 0 } : c))
                );
              }}
              className={`p-4 border-b border-slate-100 cursor-pointer transition hover:bg-white ${
                selectedUserId === chat.userId
                  ? "bg-white border-l-4 border-l-teal-500 shadow-sm"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-slate-700 text-sm">
                  {chat.userName}
                </span>
                {chat.status === "waiting" && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] uppercase font-bold rounded-full">
                    New
                  </span>
                )}
                {chat.status === "active" && (
                  <span className="text-[10px] text-slate-400">Just now</span>
                )}
              </div>
              <p
                className={`text-xs truncate ${
                  chat.unread > 0
                    ? "font-bold text-slate-800"
                    : "text-slate-500"
                }`}
              >
                {chat.messages[chat.messages.length - 1].message}
              </p>
              {chat.unread > 0 && selectedUserId !== chat.userId && (
                <div className="flex justify-end mt-2">
                  <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {chat.unread} new
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-100/50">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">
                    {selectedChat.userName}
                  </h2>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>{" "}
                    Online
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.sender === "agent" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      msg.sender === "agent" ? "items-end" : "items-start"
                    } max-w-[70%]`}
                  >
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-sm text-sm ${
                        msg.sender === "agent"
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.sender === "agent" ? "You" : "User"} •{" "}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
            <MessageSquare size={64} className="mb-4" />
            <p className="text-lg font-medium">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>

      {/* Confirm Clear All Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowClearModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowClearModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Clear All Chat History?
            </h3>
            <p className="text-slate-600 mb-6">
              This will permanently delete all chat conversations and messages.
              This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllChats();
                  setShowClearModal(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium transition bg-red-600 hover:bg-red-700 text-white"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
