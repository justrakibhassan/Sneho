// API and Socket URL Configuration
// This ensures all URLs are production-ready and configurable via environment variables

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
  "http://localhost:5000";

// For direct API calls (without /api suffix)
export const getApiUrl = (path: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return `${baseUrl}${path}`;
};

// For Socket.IO connections
export const getSocketUrl = () => {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:5000"
  );
};
