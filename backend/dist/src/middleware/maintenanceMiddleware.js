import prisma from "../config/db.js";
import jwt from "jsonwebtoken";
export const checkMaintenanceMode = async (req, res, next) => {
    try {
        // 1. Get maintenance mode status
        const setting = await prisma.systemconfig.findUnique({
            where: { key: "MAINTENANCE_MODE" },
        });
        const isMaintenanceOn = setting?.value === "true";
        // 2. If it's on, check for bypass
        if (isMaintenanceOn) {
            // Always allow access to the maintenance status endpoint itself
            if (req.path === "/api/system/maintenance-status") {
                return next();
            }
            // Check if user is admin
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer")) {
                try {
                    const token = authHeader.split(" ")[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await prisma.user.findUnique({
                        where: { id: decoded.id },
                        select: { role: true },
                    });
                    if (user && user.role === "ADMIN") {
                        return next(); // Admins can bypass
                    }
                }
                catch (err) {
                    // Token invalid, continue to block
                }
            }
            return res.status(503).json({
                success: false,
                message: "Platform is currently under maintenance. Please try again later.",
                maintenanceMode: true,
            });
        }
        next();
    }
    catch (error) {
        next();
    }
};
