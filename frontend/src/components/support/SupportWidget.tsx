"use client";

import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, X, Send, Bot, Headphones } from "lucide-react";
import { usePathname } from "next/navigation";

interface IMessage {
  sender: "user" | "bot" | "agent";
  message: string;
  timestamp: Date;
}

export default function SupportWidget() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [sessionId] = useState(
    () => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket (for both authenticated and anonymous users)
  useEffect(() => {
    const userId = isAuthenticated && user ? user.id : sessionId;

    const newSocket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
        "http://localhost:5000"
    );

    newSocket.on("connect", () => {
      newSocket.emit("join_support_room", userId);
    });

    newSocket.on("receive_message", (msg: IMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.sender === "agent") setIsAgentActive(true);
    });

    socketRef.current = newSocket;
    // Notify trigger state if needed, but here we don't need re-render on socket set
    
    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user, sessionId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    const userId = isAuthenticated && user ? user.id : sessionId;
    const userName = isAuthenticated && user ? user.name : "Guest";

    const userMessage: IMessage = {
      sender: "user",
      message: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    socketRef.current.emit("send_message", {
      userId: userId,
      userName: userName,
      message: input,
      isAgentActive,
    });
    setInput("");
  };

  const requestAgent = () => {
    if (!socketRef.current) return;

    // If anonymous user, show name input
    if (!isAuthenticated) {
      setShowNameInput(true);
      return;
    }

    // If authenticated, proceed directly with user's actual name
    const realUserName = user?.name || "Unknown User";
    proceedWithAgentRequest(realUserName);
  };

  const proceedWithAgentRequest = (userName: string) => {
    if (!socketRef.current) return;

    const userId = isAuthenticated && user ? user.id : sessionId;

    const sysMsg: IMessage = {
      sender: "bot",
      message: "Connecting to an agent...",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, sysMsg]);

    // Emit dedicated request_agent event with user info
    socketRef.current.emit("request_agent", {
      userId: userId,
      userName: userName,
    });
    setIsAgentActive(true);
    setShowNameInput(false);
  };

  const handleGuestSubmit = () => {
    if (!guestName.trim()) return;
    proceedWithAgentRequest(guestName);
  };

  const sendQuickReply = (text: string) => {
    if (!socketRef.current) return;

    const userId = isAuthenticated && user ? user.id : sessionId;
    const userName = isAuthenticated && user ? user.name : "Guest";

    const userMessage: IMessage = {
      sender: "user",
      message: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    socketRef.current.emit("send_message", {
      userId: userId,
      userName: userName,
      message: text,
      isAgentActive,
    });
  };

  const quickReplies = ["Services", "Pricing", "Safety", "Guide"];

  // Don't render on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end space-y-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-[380px] h-[calc(100vh-6rem)] max-h-[550px] md:w-[380px] md:h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-linear-to-r from-teal-600 to-teal-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                {isAgentActive ? <Headphones size={20} /> : <Bot size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-base">Sneho Support</h3>
                <p className="text-xs text-teal-50 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {isAgentActive ? "Live Agent" : "AI Assistant"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-slate-50 to-white">
            {messages.length === 0 && (
              <div className="text-center text-sm text-slate-500 mt-8 space-y-3">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Bot size={32} className="text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">
                    Welcome to Sneho!
                  </p>
                  <p className="text-xs mt-1">How can we assist you today?</p>
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: msg.message
                        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Name Input for Anonymous Users */}
          {showNameInput && (
            <div className="px-4 py-3 bg-teal-50 border-t border-teal-100">
              <p className="text-xs text-teal-700 mb-2 font-medium">
                Please enter your name to connect with an agent:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGuestSubmit()}
                  placeholder="Your name"
                  className="flex-1 bg-white border border-teal-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleGuestSubmit}
                  disabled={!guestName.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!isAgentActive && !showNameInput && (
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendQuickReply(reply)}
                  className="shrink-0 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full text-xs font-medium hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition"
                >
                  {reply}
                </button>
              ))}
              <button
                onClick={requestAgent}
                className="shrink-0 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-xs font-bold hover:bg-teal-100 transition flex items-center gap-1"
              >
                <Headphones size={12} /> Agent
              </button>
            </div>
          )}

          {/* Input Area */}
          {!showNameInput && (
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={
                    isAgentActive ? "Message agent..." : "Ask a question..."
                  }
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-teal-600 text-white p-2.5 rounded-xl hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-14 h-14 md:w-16 md:h-16 bg-linear-to-br from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 hover:shadow-2xl"
      >
        {isOpen ? (
          <X size={24} className="md:w-7 md:h-7" />
        ) : (
          <MessageCircle size={24} className="md:w-7 md:h-7" />
        )}
        {messages.length > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[10px] font-bold">{messages.length}</span>
          </span>
        )}
        <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Need help?
        </span>
      </button>
    </div>
  );
}
