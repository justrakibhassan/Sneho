"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Navigation, Clock, User, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useSessionSocket } from "@/hooks/use-session-socket";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons (Leaflet + Next.js workaround)
if (typeof window !== "undefined") {
  // @ts-expect-error - internal leaflet property
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

// Dynamically import map to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface LiveSessionMapProps {
  sessionId: number;
  userId: number;
  sitterName?: string;
  sitterAvatar?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: Date;
}

export default function LiveSessionMap({
  sessionId,
  userId,
  sitterName = "Sitter",
  sitterAvatar,
}: LiveSessionMapProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [isMapReady, setIsMapReady] = useState(false);

  const { socket, isConnected, sessionStatus } = useSessionSocket({
    sessionId,
    userId,
    role: "parent",
  });

  // Listen for real-time location updates
  useEffect(() => {
    if (!socket) return;

    socket.on("location:real_time", (data) => {
      const newLocation: LocationData = {
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        timestamp: new Date(data.timestamp),
      };

      setCurrentLocation(newLocation);
    });

    return () => {
      socket.off("location:real_time");
    };
  }, [socket]);

  // Fetch latest location on mount
  useEffect(() => {
    const fetchLatestLocation = async () => {
      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
          }/locations/session/${sessionId}/latest`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.location) {
          const loc: LocationData = {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            accuracy: data.location.accuracy,
            timestamp: new Date(data.location.timestamp),
          };
          setCurrentLocation(loc);
        }
      } catch (error) {
        console.error("Failed to fetch latest location:", error);
      }
    };

    fetchLatestLocation();
  }, [sessionId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Custom marker icon with sitter avatar
  const createAvatarIcon = (avatarUrl: string | undefined, name: string) => {
    if (typeof window === "undefined") return null;

    return L.divIcon({
      className: "custom-avatar-marker",
      html: `
        <div class="relative w-12 h-12 flex items-center justify-center">
          <div class="absolute inset-0 bg-teal-500 rounded-full shadow-lg transform -translate-y-1"></div>
          <div class="relative w-10 h-10 bg-white rounded-full overflow-hidden border-2 border-teal-500 transform -translate-y-1">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(
                    name
                  )}&background=0D9488&color=fff'" />`
                : `<div class="w-full h-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">${name.charAt(
                    0
                  )}</div>`
            }
          </div>
          <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-10 border-t-teal-500"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const [time, setTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 10000); // Update every 10s
    return () => clearInterval(timer);
  }, []);

  const getTimeSinceUpdate = () => {
    if (!currentLocation) return "No updates";
    const diff = Math.floor(
      (time - currentLocation.timestamp.getTime()) / 1000
    );
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Live Session</h3>
              <p className="text-xs text-teal-50 flex items-center gap-2">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live Tracking
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    Disconnected
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                sessionStatus.status === "ACTIVE"
                  ? "bg-green-500"
                  : sessionStatus.status === "PAUSED"
                  ? "bg-amber-500"
                  : "bg-slate-500"
              }`}
            >
              {sessionStatus.status}
            </div>
          </div>
        </div>
      </div>

      {/* Sitter Info */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
            {sitterAvatar ? (
              <img
                src={sitterAvatar}
                alt={sitterName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="text-teal-600" size={24} />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-800">{sitterName}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={12} />
              Duration: {formatDuration(sessionStatus.duration)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Last update</p>
            <p className="text-sm font-medium text-slate-700">
              {getTimeSinceUpdate()}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-96 relative">
        {currentLocation && isMapReady ? (
          <MapContainer
            center={[currentLocation.latitude, currentLocation.longitude]}
            zoom={15}
            className="h-full w-full"
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[currentLocation.latitude, currentLocation.longitude]}
              icon={createAvatarIcon(sitterAvatar, sitterName) || undefined}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{sitterName}</p>
                  <p className="text-xs text-slate-600">Current Location</p>
                  {currentLocation.accuracy && (
                    <p className="text-xs text-slate-500">
                      Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {getTimeSinceUpdate()}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : currentLocation ? (
          <div className="h-full flex items-center justify-center bg-slate-100">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading map...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-slate-100">
            <div className="text-center text-slate-500">
              <AlertCircle className="mx-auto mb-2" size={48} />
              <p className="font-medium">No location data available</p>
              <p className="text-sm">Waiting for GPS updates...</p>
            </div>
          </div>
        )}
      </div>

      {/* Location Stats */}
      {currentLocation && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-slate-500">Latitude</p>
            <p className="text-sm font-mono font-semibold text-slate-700">
              {currentLocation.latitude.toFixed(6)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Longitude</p>
            <p className="text-sm font-mono font-semibold text-slate-700">
              {currentLocation.longitude.toFixed(6)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Accuracy</p>
            <p className="text-sm font-semibold text-slate-700">
              ±{currentLocation.accuracy?.toFixed(0) || "N/A"}m
            </p>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="p-4 bg-blue-50 border-t border-blue-100">
        <p className="text-xs text-blue-700 flex items-center gap-2">
          <Navigation size={14} />
          Location updates automatically every few seconds while session is
          active
        </p>
      </div>
    </div>
  );
}
