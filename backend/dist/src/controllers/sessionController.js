import prisma from "../config/db.js";
// @desc    Start a new session
// @route   POST /api/sessions/start
// @access  Private (Sitter only)
export const startSession = async (req, res) => {
    try {
        const { bookingId, latitude, longitude } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: {
                babysitter: true,
            },
        });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }
        if (booking.babysitter.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to start a session for this booking",
            });
        }
        const existingSession = await prisma.session.findUnique({
            where: { bookingId: parseInt(bookingId) },
        });
        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: "Session already exists for this booking",
            });
        }
        const session = await prisma.session.create({
            data: {
                bookingId: parseInt(bookingId),
                sitterId: booking.babysitterId,
                parentId: booking.parentId,
                status: "ACTIVE",
                startTime: new Date(),
                totalDuration: 0,
                pausedDuration: 0,
            },
            include: {
                booking: true,
                sitter: {
                    include: { user: { select: { name: true, profilePicture: true } } },
                },
                parent: { include: { user: { select: { name: true } } } },
            },
        });
        await prisma.sessionlog.create({
            data: {
                sessionId: session.id,
                action: "STARTED",
                notes: `Session started at ${latitude}, ${longitude}`,
            },
        });
        if (latitude && longitude) {
            await prisma.location.create({
                data: {
                    sessionId: session.id,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                },
            });
        }
        res.status(201).json({
            success: true,
            message: "Session started successfully",
            session: session,
        });
    }
    catch (error) {
        console.error("Start Session Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to start session",
            error: error.message,
        });
    }
};
// @desc    Pause active session
export const pauseSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        if (session.status !== "ACTIVE") {
            return res.status(400).json({
                success: false,
                message: "Only active sessions can be paused",
            });
        }
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
        const currentDuration = session.totalDuration + elapsed - session.pausedDuration;
        const updatedSession = await prisma.session.update({
            where: { id: parseInt(id) },
            data: {
                status: "PAUSED",
                pauseTime: now,
                totalDuration: currentDuration,
            },
        });
        await prisma.sessionlog.create({
            data: {
                sessionId: session.id,
                action: "PAUSED",
                notes: "Session paused by sitter",
            },
        });
        res.json({
            success: true,
            message: "Session paused",
            session: updatedSession,
        });
    }
    catch (error) {
        console.error("Pause Session Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to pause session",
            error: error.message,
        });
    }
};
// @desc    Resume paused session
export const resumeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        if (session.status !== "PAUSED") {
            return res.status(400).json({
                success: false,
                message: "Only paused sessions can be resumed",
            });
        }
        const now = new Date();
        const pausedTime = Math.floor((now.getTime() - new Date(session.pauseTime).getTime()) / 1000);
        const updatedSession = await prisma.session.update({
            where: { id: parseInt(id) },
            data: {
                status: "ACTIVE",
                pauseTime: null,
                pausedDuration: session.pausedDuration + pausedTime,
            },
        });
        await prisma.sessionlog.create({
            data: {
                sessionId: session.id,
                action: "RESUMED",
                notes: `Session resumed after ${pausedTime}s pause`,
            },
        });
        res.json({
            success: true,
            message: "Session resumed",
            session: updatedSession,
        });
    }
    catch (error) {
        console.error("Resume Session Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to resume session",
            error: error.message,
        });
    }
};
// @desc    Complete session
export const completeSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
            include: { booking: true },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        if (session.status === "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Session already completed",
            });
        }
        const now = new Date();
        let finalDuration = session.totalDuration;
        if (session.status === "ACTIVE") {
            const elapsed = Math.floor((now.getTime() - new Date(session.startTime).getTime()) / 1000);
            finalDuration = elapsed - session.pausedDuration;
        }
        const updatedSession = await prisma.session.update({
            where: { id: parseInt(id) },
            data: {
                status: "COMPLETED",
                endTime: now,
                totalDuration: finalDuration,
            },
            include: {
                sitter: { include: { user: true } },
                parent: { include: { user: true } },
                booking: true,
            },
        });
        await prisma.sessionlog.create({
            data: {
                sessionId: session.id,
                action: "COMPLETED",
                notes: `Session completed. Total duration: ${finalDuration}s`,
            },
        });
        await prisma.booking.update({
            where: { id: session.bookingId },
            data: {
                status: "COMPLETED",
                actualEnd: now,
            },
        });
        res.json({
            success: true,
            message: "Session completed successfully",
            session: updatedSession,
            duration: finalDuration,
        });
    }
    catch (error) {
        console.error("Complete Session Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete session",
            error: error.message,
        });
    }
};
// @desc    Get session by ID
export const getSession = async (req, res) => {
    try {
        const { id } = req.params;
        const session = await prisma.session.findUnique({
            where: { id: parseInt(id) },
            include: {
                booking: true,
                sitter: {
                    include: { user: { select: { name: true, profilePicture: true } } },
                },
                parent: { include: { user: { select: { name: true } } } },
                locations: {
                    orderBy: { timestamp: "desc" },
                    take: 1,
                },
                logs: {
                    orderBy: { timestamp: "desc" },
                },
            },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        res.json({
            success: true,
            session: session,
        });
    }
    catch (error) {
        console.error("Get Session Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get session",
            error: error.message,
        });
    }
};
// @desc    Get sitter's sessions
export const getSitterSessions = async (req, res) => {
    try {
        const { sitterId } = req.params;
        const { status } = req.query;
        let actualSitterId = parseInt(sitterId);
        const babysitter = await prisma.babysitter.findUnique({
            where: { userId: parseInt(sitterId) },
        });
        if (babysitter) {
            actualSitterId = babysitter.id;
        }
        const where = { sitterId: actualSitterId };
        if (status) {
            where.status = status;
        }
        const sessions = await prisma.session.findMany({
            where,
            include: {
                booking: true,
                parent: { include: { user: { select: { name: true } } } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            success: true,
            count: sessions.length,
            sessions: sessions,
        });
    }
    catch (error) {
        console.error("Get Sitter Sessions Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get sessions",
            error: error.message,
        });
    }
};
// @desc    Get parent's sessions
export const getParentSessions = async (req, res) => {
    try {
        const { parentId } = req.params;
        const { status } = req.query;
        let actualParentId = parseInt(parentId);
        const parent = await prisma.parent.findUnique({
            where: { userId: parseInt(parentId) },
        });
        if (parent) {
            actualParentId = parent.id;
        }
        const where = { parentId: actualParentId };
        if (status) {
            where.status = status;
        }
        const sessions = await prisma.session.findMany({
            where,
            include: {
                booking: true,
                sitter: {
                    include: { user: { select: { name: true, profilePicture: true } } },
                },
                locations: {
                    orderBy: { timestamp: "desc" },
                    take: 1,
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({
            success: true,
            count: sessions.length,
            sessions: sessions,
        });
    }
    catch (error) {
        console.error("Get Parent Sessions Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get sessions",
            error: error.message,
        });
    }
};
