import prisma from "../config/db.js";
// @desc    Create a new SOS Alert
// @route   POST /api/sos
// @access  Private
export const createSOS = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        if (!latitude || !longitude) {
            return res
                .status(400)
                .json({ success: false, message: "Location coordinates are required" });
        }
        const sosAlert = await prisma.sosalert.create({
            data: {
                userId,
                latitude,
                longitude,
                status: "ACTIVE",
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phoneNumber: true,
                        role: true,
                    },
                },
            },
        });
        // Notify via Socket.io
        const anyReq = req;
        if (anyReq.io) {
            anyReq.io.to("admin_room").emit("newSOSAlert", sosAlert);
        }
        res.status(201).json({
            success: true,
            message: "SOS Alert triggered successfully. Emergency services and admins have been notified.",
            data: sosAlert,
        });
    }
    catch (error) {
        console.error("SOS Alert Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Get all SOS Alerts (Admin only)
export const getSOSAlerts = async (req, res) => {
    try {
        const alerts = await prisma.sosalert.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phoneNumber: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ success: true, data: alerts });
    }
    catch (error) {
        console.error("Fetch SOS Alerts Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Resolve an SOS Alert
export const resolveSOS = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await prisma.sosalert.update({
            where: { id: parseInt(id) },
            data: {
                status: "RESOLVED",
                resolvedAt: new Date(),
            },
        });
        res
            .status(200)
            .json({ success: true, message: "SOS Alert resolved", data: alert });
    }
    catch (error) {
        console.error("Resolve SOS Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
