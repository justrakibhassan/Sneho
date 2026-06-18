"use client";

import { useState, useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";

interface UseGPSTrackingProps {
  socket: Socket | null;
  sessionId: number | null;
  isTracking: boolean;
}

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: Date;
}

export const useGPSTracking = ({
  socket,
  sessionId,
  isTracking,
}: UseGPSTrackingProps) => {
  const [currentPosition, setCurrentPosition] = useState<GPSPosition | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isGPSPermissionGranted, setIsGPSPermissionGranted] = useState(false);
  /* const [watchId, setWatchId] = useState<number | null>(null); */

  // Request GPS permission
  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return false;
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permission.state === "granted") {
        setIsGPSPermissionGranted(true);
        return true;
      } else if (permission.state === "prompt") {
        // Will prompt when we start tracking
        return true;
      } else {
        setError("GPS permission denied");
        return false;
      }
    } catch (err) {
      console.error("Permission check error:", err);
      return true; // Fallback to trying anyway
    }
  }, []);

  // Start GPS tracking
  useEffect(() => {
    if (!socket && isTracking) return; // Need socket only if we are tracking/emitting

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const gpsData: GPSPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp),
      };

      setCurrentPosition(gpsData);
      setError(null);
      setIsGPSPermissionGranted(true);

      // Send to server via Socket.io ONLY if session is active and we have a socket
      if (isTracking && socket && sessionId) {
        socket.emit("location:update", {
          sessionId,
          latitude: gpsData.latitude,
          longitude: gpsData.longitude,
          accuracy: gpsData.accuracy,
          timestamp: gpsData.timestamp,
        });
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError("GPS permission denied. Please enable location access.");
          break;
        case err.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case err.TIMEOUT:
          setError("GPS request timed out.");
          break;
        default:
          setError("An unknown error occurred.");
      }
      console.error("GPS error:", err);
    };

    // Start watching position immediately to get an initial lock
    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    /* setWatchId(id); */

    // Cleanup
    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [isTracking, socket, sessionId]);

  // Listen for location errors from server
  useEffect(() => {
    if (!socket) return;

    socket.on("location:error", (data) => {
      setError(data.message);
    });

    socket.on("location:batch_saved", (data) => {
    });

    return () => {
      socket.off("location:error");
      socket.off("location:batch_saved");
    };
  }, [socket]);

  return {
    currentPosition,
    error,
    isGPSPermissionGranted,
    requestPermission,
  };
};
