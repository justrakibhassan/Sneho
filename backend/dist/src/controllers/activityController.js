import prisma from "../config/db.js";
// @desc    Log a new activity during a session
// @route   POST /api/activities/log
// @access  Private (Sitter only)
export const logActivity = async (req, res) => {
    try {
        const { bookingId, type, description, photoUrl } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: { babysitter: true },
        });
        if (!booking) {
            return res
                .status(404)
                .json({ success: false, message: "Booking not found" });
        }
        if (booking.babysitter.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        let report = await prisma.dailyreport.findUnique({
            where: { bookingId: parseInt(bookingId) },
        });
        if (!report) {
            report = await prisma.dailyreport.create({
                data: {
                    bookingId: parseInt(bookingId),
                },
            });
        }
        const activity = await prisma.activitylog.create({
            data: {
                reportId: report.id,
                type,
                description,
                photoUrl,
            },
        });
        res.status(201).json({
            success: true,
            message: "Activity logged successfully",
            activity: activity,
        });
    }
    catch (error) {
        console.error("Log Activity Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to log activity",
            error: error.message,
        });
    }
};
// @desc    Get Daily Report for a booking
export const getDailyReport = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const report = await prisma.dailyreport.findUnique({
            where: { bookingId: parseInt(bookingId) },
            include: {
                activitylog: {
                    orderBy: { timestamp: "asc" },
                },
                booking: {
                    include: {
                        babysitter: {
                            include: {
                                user: { select: { name: true, profilePicture: true } },
                            },
                        },
                        parent: { include: { user: { select: { name: true } } } },
                    },
                },
            },
        });
        if (!report) {
            return res
                .status(404)
                .json({ success: false, message: "Report not found" });
        }
        const userRequest = req.user;
        const userId = userRequest.id;
        if (report.booking.babysitter.userId !== userId &&
            report.booking.parent.userId !== userId) {
            return res
                .status(403)
                .json({ success: false, message: "Unauthorized to view this report" });
        }
        res.json({ success: true, report: report });
    }
    catch (error) {
        console.error("Get Report Error:", error);
        res.status(500).json({ success: false, message: "Failed to get report" });
    }
};
// @desc    Update Daily Report (Notes, Mood)
export const updateDailyReport = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { notes, moodRating } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: { babysitter: true },
        });
        if (!booking || booking.babysitter.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        const report = await prisma.dailyreport.upsert({
            where: { bookingId: parseInt(bookingId) },
            update: {
                notes,
                moodRating: moodRating ? parseInt(moodRating) : undefined,
            },
            create: {
                bookingId: parseInt(bookingId),
                notes,
                moodRating: moodRating ? parseInt(moodRating) : undefined,
            },
        });
        res.json({ success: true, message: "Report updated successfully", report: report });
    }
    catch (error) {
        console.error("Update Report Error:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to update report" });
    }
};
// @desc    Get all reports for the current sitter
export const getSitterReports = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const reports = await prisma.dailyreport.findMany({
            where: {
                booking: {
                    babysitter: {
                        userId: userId,
                    },
                },
            },
            include: {
                booking: {
                    include: {
                        parent: {
                            include: {
                                user: { select: { name: true, profilePicture: true } },
                            },
                        },
                    },
                },
                _count: {
                    select: { activitylog: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({ success: true, reports: reports });
    }
    catch (error) {
        console.error("Get Sitter Reports Error:", error);
        res.status(500).json({ success: false, message: "Failed to get reports" });
    }
};
// @desc    Get all reports for the current parent
export const getParentReports = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const reports = await prisma.dailyreport.findMany({
            where: {
                booking: {
                    parent: {
                        userId: userId,
                    },
                },
            },
            include: {
                booking: {
                    include: {
                        babysitter: {
                            include: {
                                user: { select: { name: true, profilePicture: true } },
                            },
                        },
                    },
                },
                _count: {
                    select: { activitylog: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json({ success: true, reports: reports });
    }
    catch (error) {
        console.error("Get Parent Reports Error:", error);
        res.status(500).json({ success: false, message: "Failed to get reports" });
    }
};
