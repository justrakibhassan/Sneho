"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import dynamic from "next/dynamic";
const LiveSessionMap = dynamic(
  () => import("@/components/session/LiveSessionMap"),
  { ssr: false }
);
import { Clock, MapPin, Calendar, DollarSign, User } from "lucide-react";

interface Session {
  id: number;
  bookingId: number;
  status: string;
  startTime: string;
  totalDuration: number;
  createdAt: string;
  sitter: {
    user: {
      name: string;
      profilePicture?: string;
    };
  };
  booking: {
    startTime: string;
    endTime: string;
  };
}

export default function SessionMonitorPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        // Assuming user.id is the parent ID
        const res = await axiosInstance.get(`/sessions/parent/${user.id}`);
        const data = res.data;
        if (data.success) {
          const active = data.sessions.filter(
            (s: Session) => s.status === "ACTIVE" || s.status === "PAUSED"
          );
          const past = data.sessions.filter(
            (s: Session) => s.status === "COMPLETED"
          );

          setActiveSessions(active);
          setPastSessions(past.slice(0, 5)); // Last 5
          if (active.length > 0) {
            setSelectedSession(active[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    // Refresh every 30s
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view sessions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Session Monitor
          </h1>
            <p className="text-slate-600">
              Track your sitter&apos;s active sessions in real-time
            </p>
        </div>

        {activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Sessions List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Active Sessions
              </h2>
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`bg-white rounded-xl p-4 cursor-pointer transition border-2 ${
                    selectedSession?.id === session.id
                      ? "border-teal-500 shadow-lg"
                      : "border-transparent hover:border-teal-200 shadow"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      {session.sitter.user.profilePicture ? (
                        <img
                          src={session.sitter.user.profilePicture}
                          alt={session.sitter.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              session.sitter.user.name
                            )}&background=0D9488&color=fff`;
                          }}
                        />
                      ) : (
                        <User className="text-teal-600" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">
                        {session.sitter.user.name}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          session.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            session.status === "ACTIVE"
                              ? "bg-green-500 animate-pulse"
                              : "bg-amber-500"
                          }`}
                        />
                        {session.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={14} />
                      <span>{formatDuration(session.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar size={14} />
                      <span>{formatDate(session.startTime)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Live Map */}
            <div className="lg:col-span-2">
              {selectedSession && (
                <LiveSessionMap
                  sessionId={selectedSession.id}
                  userId={user!.id}
                  sitterName={selectedSession.sitter.user.name}
                  sitterAvatar={selectedSession.sitter.user.profilePicture}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="text-slate-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              No Active Sessions
            </h3>
            <p className="text-slate-600 mb-6">
                You haven&apos;t been booked for any sessions yet. Check your availability to attract parents!.
            </p>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Recent Sessions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl p-4 shadow border border-slate-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="text-slate-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {session.sitter.user.name}
                      </p>
                      <p className="text-xs text-slate-500">Completed</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Duration:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDuration(session.totalDuration)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Date:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(session.startTime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
