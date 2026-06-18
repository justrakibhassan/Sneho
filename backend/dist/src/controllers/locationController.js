import prisma from "../config/db.js";
// @desc    Save GPS location(s) for a session
export const saveLocation = async (req, res) => {
    try {
        const { sessionId, latitude, longitude, accuracy } = req.body;
        const session = await prisma.session.findUnique({
            where: { id: parseInt(sessionId) },
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
                message: "Can only save locations for active sessions",
            });
        }
        const location = await prisma.location.create({
            data: {
                sessionId: parseInt(sessionId),
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                accuracy: accuracy ? parseFloat(accuracy) : null,
            },
        });
        res.status(201).json({
            success: true,
            message: "Location saved",
            location: location,
        });
    }
    catch (error) {
        console.error("Save Location Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save location",
            error: error.message,
        });
    }
};
// @desc    Batch save multiple GPS locations
export const batchSaveLocations = async (req, res) => {
    try {
        const { sessionId, locations } = req.body;
        if (!Array.isArray(locations) || locations.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Locations array is required",
            });
        }
        const session = await prisma.session.findUnique({
            where: { id: parseInt(sessionId) },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        const locationData = locations.map((loc) => ({
            sessionId: parseInt(sessionId),
            latitude: parseFloat(loc.latitude),
            longitude: parseFloat(loc.longitude),
            accuracy: loc.accuracy ? parseFloat(loc.accuracy) : null,
            timestamp: loc.timestamp ? new Date(loc.timestamp) : new Date(),
        }));
        const result = await prisma.location.createMany({
            data: locationData,
            skipDuplicates: true,
        });
        res.status(201).json({
            success: true,
            message: `${result.count} locations saved`,
            count: result.count,
        });
    }
    catch (error) {
        console.error("Batch Save Locations Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save locations",
            error: error.message,
        });
    }
};
// @desc    Get all locations for a session
export const getSessionLocations = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit, offset } = req.query;
        const locations = await prisma.location.findMany({
            where: { sessionId: parseInt(sessionId) },
            orderBy: { timestamp: "asc" },
            take: limit ? parseInt(limit) : undefined,
            skip: offset ? parseInt(offset) : undefined,
        });
        const totalCount = await prisma.location.count({
            where: { sessionId: parseInt(sessionId) },
        });
        res.json({
            success: true,
            count: locations.length,
            total: totalCount,
            locations: locations,
        });
    }
    catch (error) {
        console.error("Get Session Locations Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get locations",
            error: error.message,
        });
    }
};
// @desc    Get latest location for a session
export const getLatestLocation = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const location = await prisma.location.findFirst({
            where: { sessionId: parseInt(sessionId) },
            orderBy: { timestamp: "desc" },
        });
        if (!location) {
            return res.status(404).json({
                success: false,
                message: "No location found for this session",
            });
        }
        res.json({
            success: true,
            location: location,
        });
    }
    catch (error) {
        console.error("Get Latest Location Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get location",
            error: error.message,
        });
    }
};
// @desc    Get location path/route for a session
export const getSessionPath = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma.session.findUnique({
            where: { id: parseInt(sessionId) },
            include: {
                locations: {
                    orderBy: { timestamp: "asc" },
                    select: {
                        latitude: true,
                        longitude: true,
                        timestamp: true,
                    },
                },
                booking: {
                    select: {
                        startTime: true,
                        endTime: true,
                    },
                },
            },
        });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found",
            });
        }
        const path = session.locations.map((loc) => ({
            lat: loc.latitude,
            lng: loc.longitude,
            time: loc.timestamp,
        }));
        res.json({
            success: true,
            sessionId: session.id,
            status: session.status,
            duration: session.totalDuration,
            path,
            startPoint: path[0] || null,
            endPoint: path[path.length - 1] || null,
            totalPoints: path.length,
        });
    }
    catch (error) {
        console.error("Get Session Path Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get session path",
            error: error.message,
        });
    }
};
// @desc    Delete old location data (cleanup)
export const cleanupOldLocations = async (req, res) => {
    try {
        const { daysOld = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));
        const result = await prisma.location.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate,
                },
            },
        });
        res.json({
            success: true,
            message: `Deleted ${result.count} location records older than ${daysOld} days`,
            deletedCount: result.count,
        });
    }
    catch (error) {
        console.error("Cleanup Locations Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cleanup locations",
            error: error.message,
        });
    }
};
