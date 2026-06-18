"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import axiosInstance from "@/lib/axios";
import SessionControlPanel from "@/components/session/SessionControlPanel";
import { Clock, Calendar, MapPin, CheckCircle } from "lucide-react";

interface Session {
  id: number;
  bookingId: number;
  parentId: number;
  status: string;
  startTime: string;
  totalDuration: number;
  createdAt: string;
  parent: {
    id?: number;
    user: {
      name: string;
    };
  };
  booking: {
    id: number;
    startTime: string;
    endTime: string;
  };
}

interface Booking {
  id: number;
  parentId: number;
  status: string;
  startTime: string;
  endTime: string;
  parent: {
    id: number;
    user: {
      name: string;
    };
  };
}

export default function MySessionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        const res = await axiosInstance.get(`/sessions/sitter/${user.id}`);
        const data = res.data;
        if (data.success) {
          const active = data.sessions.find(
            (s: Session) => s.status === "ACTIVE" || s.status === "PAUSED"
          );
          const past = data.sessions.filter(
            (s: Session) => s.status === "COMPLETED"
          );

          setActiveSession(active || null);
          setPastSessions(past.slice(0, 10));

          // Fetch confirmed bookings if no active session
          if (!active) {
            const bookingsRes = await axiosInstance.get("/bookings/my-bookings");
            const bookingsData = bookingsRes.data;
            if (bookingsData.success) {
              const confirmed = bookingsData.data.filter(
                (b: Booking) => b.status === "CONFIRMED"
              );
              setConfirmedBookings(confirmed);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
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

  const handleSessionStart = () => {
    // Refetch sessions after starting
    window.location.reload();
  };

  const handleSessionComplete = () => {
    // Refetch sessions after completing
    window.location.reload();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            My Sessions
          </h1>
          <p className="text-slate-600">
            Manage your work sessions and track your time
          </p>
        </div>

        {/* Active Session */}
        {activeSession ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Active Session
            </h2>
            <SessionControlPanel
              bookingId={activeSession.bookingId}
              sessionId={activeSession.id}
              onSessionStart={handleSessionStart}
              onSessionComplete={handleSessionComplete}
            />
          </div>
        ) : selectedBooking ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Start New Session
            </h2>
            <SessionControlPanel
              bookingId={selectedBooking.id}
              sessionId={null}
              onSessionStart={handleSessionStart}
              onSessionComplete={handleSessionComplete}
            />
            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-4 text-sm text-teal-600 font-medium hover:underline"
            >
              ← Back to booking list
            </button>
          </div>
        ) : confirmedBookings.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Available Bookings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl p-6 shadow border border-slate-200 hover:border-teal-300 transition cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <Calendar className="text-teal-600" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {booking.parent.user.name}
                      </h3>
                      <p className="text-xs text-slate-500">Confirmed Booking</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(booking.startTime)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(booking.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - {new Date(booking.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-teal-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-teal-700 transition">
                    Select to Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="text-slate-400" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              No Active Session
            </h3>
            <p className="text-slate-600 mb-6">
              You don&apos;t have any active work session or confirmed bookings at the moment.
            </p>
            <p className="text-sm text-slate-500">
              Accept a job request first to start a session.
            </p>
          </div>
        )}

        {/* Session History */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Session History
            </h2>
            <div className="space-y-4">
              {pastSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl p-6 shadow border border-slate-200 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            Session with {session.parent.user.name}
                          </h3>
                          <p className="text-xs text-slate-500">Completed</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Duration
                          </p>
                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <Clock size={14} />
                            {formatDuration(session.totalDuration)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Date</p>
                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(session.startTime)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">
                            Location Tracked
                          </p>
                          <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin size={14} />
                            Yes
                          </p>
                        </div>
                      </div>
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
