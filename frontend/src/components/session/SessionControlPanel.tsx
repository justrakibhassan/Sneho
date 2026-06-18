"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSessionSocket } from "@/hooks/use-session-socket";
import { useGPSTracking } from "@/hooks/use-gps-tracking";
import {
  Play,
  Pause,
  AlertCircle,
  Coffee,
  Moon,
  Camera,
  CheckCircle2,
  X,
  Star,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

export default function SessionControlPanel({
  bookingId,
  sessionId,
  onSessionStart,
  onSessionComplete,
}: {
  bookingId: number;
  sessionId: number | null;
  onSessionStart: () => void;
  onSessionComplete: () => void;
}) {
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showFinalReportModal, setShowFinalReportModal] = useState(false);
  const [logType, setLogType] = useState<"MEAL" | "NAP" | "ACTIVITY">(
    "ACTIVITY"
  );
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [isTriggeringSOS, setIsTriggeringSOS] = useState(false);
  const [moodRating, setMoodRating] = useState(5);
  const [notes, setNotes] = useState("");

  // Session socket hook
  const {
    socket,
    isConnected,
    sessionStatus,
    pauseSession,
    resumeSession,
    requestSessionState,
  } = useSessionSocket({
    sessionId,
    userId: user?.id || 0,
    role: "sitter",
  });

  // GPS tracking hook
  const {
    currentPosition,
    error: gpsError,
    requestPermission,
  } = useGPSTracking({
    socket,
    sessionId,
    isTracking: sessionStatus.status === "ACTIVE",
  });

  // Request GPS permission when component mounts
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Request session state when connected
  useEffect(() => {
    if (isConnected && sessionId) {
      requestSessionState();
    }
  }, [isConnected, sessionId, requestSessionState]);

  // Format duration (seconds to HH:MM:SS)
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = async () => {
    if (!user || !currentPosition) return;

    setIsStarting(true);
    try {
      const response = await axiosInstance.post("/sessions/start", {
        bookingId,
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
      });

      if (response.data.success) {
        onSessionStart();
      } else {
        console.error("Failed to start session:", response.data.message);
      }
    } catch (error) {
      console.error("Start session error:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const handlePauseSession = () => {
    pauseSession();
  };

  const handleResumeSession = () => {
    resumeSession();
  };

  const handleLogActivity = async () => {
    if (!description) {
      toast.error("Please add a description");
      return;
    }

    setIsLogging(true);
    try {
      const response = await axiosInstance.post("/activities/log", {
        bookingId,
        type: logType,
        description: description,
        photoUrl: photoUrl || null,
      });

      if (response.data.success) {
        toast.success(`${logType} logged successfully!`);
        setShowLogModal(false);
        setDescription("");
        setPhotoUrl("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Log activity error:", error);
      toast.error("Failed to log activity");
    } finally {
      setIsLogging(false);
    }
  };

  const submitFinalReport = async () => {
    setIsCompleting(true);
    try {
      const reportResponse = await axiosInstance.patch(
        `/activities/report/${bookingId}`,
        {
          notes,
          moodRating,
        }
      );

      if (!reportResponse.data.success) {
        throw new Error(reportResponse.data.message);
      }

      const response = await axiosInstance.post(
        `/sessions/${sessionId}/complete`
      );

      if (response.data.success) {
        toast.success("Session completed and report generated!");
        onSessionComplete();
      }
    } catch (error) {
      console.error("Complete session error:", error);
      toast.error("Failed to complete session");
    } finally {
      setIsCompleting(false);
      setShowFinalReportModal(false);
    }
  };

  const handleSOSAlert = async () => {
    if (!currentPosition) {
      toast.error("Location data is required for SOS alert");
      return;
    }

    if (
      !confirm(
        "⚠️ TRIGGER EMERGENCY SOS? This will notify all admins and authorities immediately."
      )
    ) {
      return;
    }

    setIsTriggeringSOS(true);
    try {
      const response = await axiosInstance.post("/sos", {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
      });

      if (response.data.success) {
        toast.error("🚨 SOS SENT! Please stay calm and wait for assistance.", {
          duration: 10000,
          style: {
            background: "#ff0000",
            color: "#fff",
            fontWeight: "bold",
          },
        });
      }
    } catch (error) {
      console.error("SOS Trigger Error:", error);
      toast.error("Failed to send SOS. Call emergency services directly!");
    } finally {
      setIsTriggeringSOS(false);
    }
  };

  const handleCompleteSession = () => {
    setShowFinalReportModal(true);
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Session Control</h2>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi size={16} />
              <span className="text-xs font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff size={16} />
              <span className="text-xs font-medium">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
            sessionStatus.status === "ACTIVE"
              ? "bg-green-100 text-green-700"
              : sessionStatus.status === "PAUSED"
              ? "bg-amber-100 text-amber-700"
              : sessionStatus.status === "COMPLETED"
              ? "bg-slate-100 text-slate-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              sessionStatus.status === "ACTIVE"
                ? "bg-green-500 animate-pulse"
                : "bg-current"
            }`}
          />
          {sessionStatus.status === "NOT_STARTED"
            ? "Ready to Start"
            : sessionStatus.status}
        </div>
      </div>

      {/* Duration Display */}
      {sessionId && (
        <div className="mb-6 bg-linear-to-r from-teal-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-teal-600" size={24} />
            <span className="text-sm font-medium text-slate-600">
              Session Duration
            </span>
          </div>
          <div className="text-4xl font-bold text-slate-800 font-mono">
            {formatDuration(sessionStatus.duration)}
          </div>
          {sessionStatus.pausedDuration > 0 && (
            <div className="text-xs text-slate-500 mt-2">
              Paused: {formatDuration(sessionStatus.pausedDuration)}
            </div>
          )}
        </div>
      )}

      {/* GPS Status */}
      {currentPosition ? (
        <div className="mb-6 flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <MapPin className="text-green-600" size={20} />
          <div className="flex-1">
            <p className="text-xs font-medium text-green-700">GPS Active</p>
            <p className="text-[10px] text-green-600">
              Accuracy: ±{currentPosition.accuracy?.toFixed(0) || "N/A"}m
            </p>
          </div>
        </div>
      ) : gpsError ? (
        <div className="mb-6 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600" size={20} />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-700">GPS Error</p>
            <p className="text-[10px] text-red-600">{gpsError}</p>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <MapPin className="text-amber-600" size={20} />
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-700">
              Waiting for GPS...
            </p>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-3">
        {sessionStatus.status === "NOT_STARTED" && (
          <button
            onClick={handleStartSession}
            disabled={isStarting || !currentPosition}
            className="w-full bg-linear-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={24} fill="currentColor" />
            {isStarting ? "Starting..." : "Start Session"}
          </button>
        )}

        {sessionStatus.status === "ACTIVE" && (
          <>
            <button
              onClick={() => setShowLogModal(true)}
              className="w-full bg-teal-50 border-2 border-teal-200 text-teal-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition hover:bg-teal-100"
            >
              <Activity size={20} />
              Log Activity
            </button>

            <button
              onClick={handlePauseSession}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg"
            >
              <Pause size={24} />
              Pause Session
            </button>

            <button
              onClick={handleSOSAlert}
              disabled={isTriggeringSOS}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg animate-pulse"
            >
              <AlertCircle size={24} />
              {isTriggeringSOS ? "Sending SOS..." : "EMERGENCY SOS"}
            </button>

            <button
              onClick={handleCompleteSession}
              disabled={isCompleting}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg disabled:opacity-50"
            >
              <CheckCircle2 size={24} />
              {isCompleting ? "Completing..." : "Complete Session"}
            </button>
          </>
        )}

        {sessionStatus.status === "PAUSED" && (
          <>
            <button
              onClick={() => setShowLogModal(true)}
              className="w-full bg-teal-50 border-2 border-teal-200 text-teal-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition hover:bg-teal-100"
            >
              <Activity size={20} />
              Log Activity
            </button>

            <button
              onClick={handleResumeSession}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg"
            >
              <Play size={24} fill="currentColor" />
              Resume Session
            </button>

            <button
              onClick={handleCompleteSession}
              disabled={isCompleting}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg disabled:opacity-50"
            >
              <CheckCircle2 size={24} />
              {isCompleting ? "Completing..." : "Complete Session"}
            </button>
          </>
        )}

        {sessionStatus.status === "COMPLETED" && (
          <div className="text-center py-4 text-slate-600">
            <p className="font-semibold">Session completed!</p>
            <p className="text-sm">
              Total duration: {formatDuration(sessionStatus.duration)}
            </p>
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">
                Log Activity
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "MEAL" as const, icon: Coffee, label: "Meal" },
                  { id: "NAP" as const, icon: Moon, label: "Nap" },
                  { id: "ACTIVITY" as const, icon: Activity, label: "Misc" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setLogType(type.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      logType === type.id
                        ? "border-teal-600 bg-teal-50 text-teal-700 scale-105"
                        : "border-slate-100 hover:border-slate-200 text-slate-500"
                    }`}
                  >
                    <type.icon size={24} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? (e.g. Ate 1 bowl of fruit)"
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all h-32 resize-none text-slate-700"
                />
              </div>

              {/* Photo Placeholder */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Photo URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://image-url.com"
                    className="flex-1 p-3 rounded-xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all text-sm"
                  />
                  <button className="p-3 bg-slate-100 rounded-xl text-slate-500">
                    <Camera size={20} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogActivity}
                disabled={isLogging}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-teal-100 disabled:opacity-50"
              >
                {isLogging ? "Logging..." : "Save Activity"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Report Modal */}
      {showFinalReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">
                Final Daily Report
              </h3>
              <button
                onClick={() => setShowFinalReportModal(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mood Rating */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-3">
                  Overall Child Mood
                </label>
                <div className="flex justify-between items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMoodRating(star)}
                      className={`p-3 rounded-xl transition-all ${
                        moodRating >= star
                          ? "text-amber-500 scale-110"
                          : "text-slate-200"
                      }`}
                    >
                      <Star
                        size={32}
                        fill={moodRating >= star ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sitter Notes */}
              <div>
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-2">
                  Final Summary / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summary of the day for the parent..."
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all h-32 resize-none text-slate-700"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowFinalReportModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black transition"
                >
                  Go Back
                </button>
                <button
                  onClick={submitFinalReport}
                  disabled={isCompleting}
                  className="flex-2 bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-black text-lg transition shadow-xl shadow-teal-100 disabled:opacity-50"
                >
                  {isCompleting ? "Submitting..." : "Finish & Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {sessionStatus.status === "NOT_STARTED" && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> GPS tracking will start automatically when you
            begin the session. Make sure location permissions are enabled.
          </p>
        </div>
      )}
    </div>
  );
}
