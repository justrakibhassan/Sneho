import prisma from "../config/db.js";
// @desc    Get Admin Dashboard Stats (Real Data)
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const pendingSitters = await prisma.user.count({
            where: {
                role: "BABYSITTER",
                isApproved: false,
            },
        });
        const activeBookings = await prisma.booking.count({
            where: {
                status: "CONFIRMED",
            },
        });
        const revenueAgg = await prisma.booking.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                status: "COMPLETED",
            },
        });
        const recentBookings = await prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                parent: { include: { user: { select: { name: true } } } },
                babysitter: { include: { user: { select: { name: true } } } },
            },
        });
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                pendingSitters,
                activeBookings,
                totalRevenue: revenueAgg._sum.totalAmount || 0,
            },
            recentActivity: recentBookings,
        });
    }
    catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
// @desc    Get Pending Approvals List
// @route   GET /api/admin/approvals
export const getPendingApprovals = async (req, res) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: {
                role: "BABYSITTER",
                isApproved: false,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                babysitter: {
                    select: { experienceYears: true, locationAddress: true },
                },
            },
        });
        res.status(200).json({ success: true, users: pendingUsers });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
// @desc    Get All Users (Search & Filter)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isApproved: true,
                isBanned: true,
                createdAt: true,
                parent: { select: { id: true } },
                babysitter: { select: { id: true } },
            },
        });
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
// @desc    Manage User (Delete or Ban)
// @route   PATCH /api/admin/users/:id
export const manageUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'delete', 'ban', 'unban'
        if (action === "delete") {
            await prisma.user.delete({ where: { id: parseInt(id) } });
            return res
                .status(200)
                .json({ success: true, message: "User deleted permanently." });
        }
        if (action === "ban") {
            await prisma.user.update({
                where: { id: parseInt(id) },
                data: { isBanned: true },
            });
            return res
                .status(200)
                .json({ success: true, message: "User has been banned." });
        }
        if (action === "unban") {
            await prisma.user.update({
                where: { id: parseInt(id) },
                data: { isBanned: false },
            });
            return res
                .status(200)
                .json({ success: true, message: "User unbanned successfully." });
        }
        if (action === "change-role") {
            const { role } = req.body;
            const validRoles = ["USER", "PARENT", "BABYSITTER", "ADMIN"];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }
            await prisma.user.update({
                where: { id: parseInt(id) },
                data: { role },
            });
            return res.status(200).json({
                success: true,
                message: `User role updated to ${role}.`,
            });
        }
        res.status(400).json({ message: "Invalid action" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Action failed" });
    }
};
// @desc    Get Single User Details (For Admin Review)
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                babysitter: { include: { availability: true } },
                parent: true,
            },
        });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.status(200).json({ success: true, user: user });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
// @desc    Get All Bookings (Admin)
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                parent: {
                    include: {
                        user: { select: { name: true, email: true, phoneNumber: true } },
                    },
                },
                babysitter: {
                    include: { user: { select: { name: true, email: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: bookings });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Update Booking Status (Admin)
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = [
            "PENDING",
            "ACCEPTED",
            "COMPLETED",
            "CANCELLED",
            "CONFIRMED",
            "LIVE",
        ];
        if (!validStatuses.includes(status)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid status" });
        }
        const updatedBooking = await prisma.booking.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                parent: { include: { user: true } },
                babysitter: { include: { user: true } },
            },
        });
        res.json({
            success: true,
            message: `Booking marked as ${status}`,
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Update failed" });
    }
};
// @desc    Get all pending sitter applications
export const getPendingSitters = async (req, res) => {
    try {
        const applicants = await prisma.user.findMany({
            where: {
                sitterStatus: "PENDING",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                createdAt: true,
                babysitter: {
                    select: {
                        id: true,
                        locationAddress: true,
                        experienceYears: true,
                        hourlyRate: true,
                        bio: true,
                        gender: true,
                        dob: true,
                        skills: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, data: applicants });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
// @desc    Approve a sitter
export const approveSitter = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                role: "BABYSITTER",
                sitterStatus: "APPROVED",
                isApproved: true,
                babysitter: {
                    update: { isApproved: true },
                },
            },
        });
        res.json({ success: true, message: "Sitter Approved Successfully!" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Approval Failed" });
    }
};
// @desc    Reject a sitter
export const rejectSitter = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                sitterStatus: "REJECTED",
            },
        });
        res.json({ success: true, message: "Application Rejected." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Rejection Failed" });
    }
};
