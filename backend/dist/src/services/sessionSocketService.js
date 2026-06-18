import prisma from "../config/db.js";
let io;
export const initSessionSocket = (socketIO) => {
    io = socketIO;
    io.on("connection", (socket) => {
        // ============================================
        // SESSION MANAGEMENT EVENTS
        // ============================================
        // Sitter joins their session room
        socket.on("session:join", async (data) => {
            const { sessionId, userId, role } = data;
            const roomName = `session_${sessionId}`;
            socket.join(roomName);
            // Notify room members
            socket.to(roomName).emit("session:user_joined", {
                userId,
                role,
                timestamp: new Date(),
            });
        });
        // Session status change (start, pause, resume, complete)
        socket.on("session:status_change", async (data) => {
            const { sessionId, status, metadata } = data;
            const roomName = `session_${sessionId}`;
            try {
                // Save to database via controller logic
                let updatedSession;
                if (status === "paused") {
                    const session = await prisma.session.findUnique({
                        where: { id: parseInt(sessionId) },
                    });
                    if (session && session.status === "ACTIVE") {
                        const now = new Date();
                        const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
                        const currentDuration = session.totalDuration + elapsed - session.pausedDuration;
                        updatedSession = await prisma.session.update({
                            where: { id: parseInt(sessionId) },
                            data: {
                                status: "PAUSED",
                                pauseTime: now,
                                totalDuration: currentDuration,
                            },
                        });
                        await prisma.sessionlog.create({
                            data: {
                                sessionId: parseInt(sessionId),
                                action: "PAUSED",
                                notes: metadata?.reason || "Session paused by sitter",
                            },
                        });
                    }
                }
                else if (status === "resumed") {
                    const session = await prisma.session.findUnique({
                        where: { id: parseInt(sessionId) },
                    });
                    if (session && session.status === "PAUSED") {
                        const now = new Date();
                        const pausedTime = Math.floor((now.getTime() - new Date(session.pauseTime).getTime()) / 1000);
                        updatedSession = await prisma.session.update({
                            where: { id: parseInt(sessionId) },
                            data: {
                                status: "ACTIVE",
                                pauseTime: null,
                                pausedDuration: session.pausedDuration + pausedTime,
                            },
                        });
                        await prisma.sessionlog.create({
                            data: {
                                sessionId: parseInt(sessionId),
                                action: "RESUMED",
                                notes: `Session resumed after ${pausedTime}s pause`,
                            },
                        });
                    }
                }
                // Broadcast status change to all room members
                io.to(roomName).emit("session:status_updated", {
                    sessionId,
                    status: updatedSession ? updatedSession.status : status,
                    timestamp: new Date(),
                    session: updatedSession,
                });
            }
            catch (error) {
                console.error("Session status change error:", error);
                socket.emit("session:error", {
                    message: "Failed to update session status",
                    error: error.message,
                });
            }
        });
        // ============================================
        // GPS LOCATION TRACKING
        // ============================================
        // Real-time location update from sitter
        socket.on("location:update", async (data) => {
            const { sessionId, latitude, longitude, accuracy, timestamp } = data;
            const roomName = `session_${sessionId}`;
            try {
                // Verify session is active
                const session = await prisma.session.findUnique({
                    where: { id: parseInt(sessionId) },
                });
                if (!session || session.status !== "ACTIVE") {
                    socket.emit("location:error", {
                        message: "Session is not active",
                    });
                    return;
                }
                // Save location to database (async, non-blocking)
                prisma.location
                    .create({
                    data: {
                        sessionId: parseInt(sessionId),
                        latitude: typeof latitude === "string" ? parseFloat(latitude) : latitude,
                        longitude: typeof longitude === "string" ? parseFloat(longitude) : longitude,
                        accuracy: accuracy ? (typeof accuracy === "string" ? parseFloat(accuracy) : accuracy) : null,
                        timestamp: timestamp ? new Date(timestamp) : new Date(),
                    },
                })
                    .catch((err) => console.error("Location save error:", err));
                // Broadcast live location to parent (and admin if monitoring)
                socket.to(roomName).emit("location:real_time", {
                    sessionId,
                    latitude: typeof latitude === "string" ? parseFloat(latitude) : latitude,
                    longitude: typeof longitude === "string" ? parseFloat(longitude) : longitude,
                    accuracy,
                    timestamp: timestamp || new Date(),
                });
            }
            catch (error) {
                console.error("Location update error:", error);
                socket.emit("location:error", {
                    message: "Failed to update location",
                    error: error.message,
                });
            }
        });
        // Batch location update (for offline sync)
        socket.on("location:batch_update", async (data) => {
            const { sessionId, locations } = data;
            try {
                if (!Array.isArray(locations) || locations.length === 0) {
                    socket.emit("location:error", {
                        message: "Invalid locations array",
                    });
                    return;
                }
                const locationData = locations.map((loc) => ({
                    sessionId: parseInt(sessionId),
                    latitude: typeof loc.latitude === "string" ? parseFloat(loc.latitude) : loc.latitude,
                    longitude: typeof loc.longitude === "string" ? parseFloat(loc.longitude) : loc.longitude,
                    accuracy: loc.accuracy ? (typeof loc.accuracy === "string" ? parseFloat(loc.accuracy) : loc.accuracy) : null,
                    timestamp: loc.timestamp ? new Date(loc.timestamp) : new Date(),
                }));
                const result = await prisma.location.createMany({
                    data: locationData,
                    skipDuplicates: true,
                });
                socket.emit("location:batch_saved", {
                    count: result.count,
                    message: `${result.count} locations saved`,
                });
            }
            catch (error) {
                console.error("Batch location update error:", error);
                socket.emit("location:error", {
                    message: "Failed to save batch locations",
                    error: error.message,
                });
            }
        });
        // ============================================
        // SESSION DURATION UPDATES
        // ============================================
        // Request current session duration
        socket.on("session:get_duration", async (data) => {
            const { sessionId } = data;
            try {
                const session = await prisma.session.findUnique({
                    where: { id: parseInt(sessionId) },
                });
                if (!session) {
                    socket.emit("session:error", {
                        message: "Session not found",
                    });
                    return;
                }
                let currentDuration = session.totalDuration;
                // Calculate live duration if session is active
                if (session.status === "ACTIVE" && session.startTime) {
                    const now = new Date();
                    const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
                    currentDuration = elapsed - session.pausedDuration;
                }
                socket.emit("session:duration_update", {
                    sessionId,
                    duration: currentDuration,
                    status: session.status,
                    pausedDuration: session.pausedDuration,
                });
            }
            catch (error) {
                console.error("Get duration error:", error);
                socket.emit("session:error", {
                    message: "Failed to get session duration",
                    error: error.message,
                });
            }
        });
        // ============================================
        // PARENT MONITORING
        // ============================================
        // Parent requests current session state
        socket.on("session:request_state", async (data) => {
            const { sessionId } = data;
            try {
                const session = await prisma.session.findUnique({
                    where: { id: parseInt(sessionId) },
                    include: {
                        sitter: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        profilePicture: true,
                                    },
                                },
                            },
                        },
                        locations: {
                            orderBy: { timestamp: "desc" },
                            take: 1,
                        },
                    },
                });
                if (!session) {
                    socket.emit("session:error", {
                        message: "Session not found",
                    });
                    return;
                }
                socket.emit("session:state", {
                    session,
                    latestLocation: session.locations[0] || null,
                });
            }
            catch (error) {
                console.error("Request state error:", error);
                socket.emit("session:error", {
                    message: "Failed to get session state",
                    error: error.message,
                });
            }
        });
        // ============================================
        // DISCONNECT HANDLING
        // ============================================
        socket.on("disconnect", () => {
        });
    });
};
// Helper function to broadcast duration updates periodically
export const startDurationBroadcast = () => {
    setInterval(async () => {
        try {
            // Get all active sessions
            const activeSessions = await prisma.session.findMany({
                where: { status: "ACTIVE" },
                select: { id: true, startTime: true, pausedDuration: true },
            });
            activeSessions.forEach((session) => {
                const now = new Date();
                const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
                const currentDuration = elapsed - session.pausedDuration;
                // Broadcast to session room
                io.to(`session_${session.id}`).emit("session:duration_tick", {
                    sessionId: session.id,
                    duration: currentDuration,
                });
            });
        }
        catch (error) {
            console.error("Duration broadcast error:", error);
        }
    }, 10000); // Every 10 seconds
};
export default { initSessionSocket, startDurationBroadcast };
