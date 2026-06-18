import prisma from "../config/db.js";
// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Parent Only)
export const createBooking = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const { babysitterId, startTime, endTime } = req.body;
        if (!babysitterId || !startTime || !endTime) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const parent = await prisma.parent.findUnique({
            where: { userId: userId },
            include: { user: true },
        });
        if (!parent) {
            return res.status(404).json({
                message: "Please complete your Parent Profile first in Settings.",
            });
        }
        const sitterIdInt = parseInt(babysitterId);
        const sitter = await prisma.babysitter.findUnique({
            where: { id: sitterIdInt },
        });
        if (!sitter) {
            return res.status(404).json({ message: "Babysitter not found." });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours <= 0) {
            return res
                .status(400)
                .json({ message: "End time must be after start time." });
        }
        const rate = parseFloat((sitter.hourlyRate || 0).toString());
        const totalCost = durationHours * rate;
        const booking = await prisma.booking.create({
            data: {
                parentId: parent.id,
                babysitterId: sitter.id,
                startTime: start,
                endTime: end,
                totalAmount: totalCost,
                status: "PENDING",
            },
        });
        res.status(201).json({
            success: true,
            message: "Booking request sent successfully!",
            booking,
        });
    }
    catch (error) {
        console.error("CRITICAL BOOKING ERROR:", error);
        res
            .status(500)
            .json({ message: "Failed to create booking. Check server logs." });
    }
};
export const getMyBookings = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const role = userRequest.role;
        let bookings;
        if (role === "PARENT") {
            const parent = await prisma.parent.findUnique({ where: { userId } });
            if (!parent)
                return res.status(404).json({ message: "Profile not found" });
            bookings = await prisma.booking.findMany({
                where: { parentId: parent.id },
                include: {
                    review: true,
                    babysitter: {
                        include: {
                            user: {
                                select: { name: true, email: true, profilePicture: true },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }
        else if (role === "BABYSITTER") {
            const sitter = await prisma.babysitter.findUnique({ where: { userId } });
            if (!sitter)
                return res.status(404).json({ message: "Profile not found" });
            bookings = await prisma.booking.findMany({
                where: { babysitterId: sitter.id },
                include: {
                    parent: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                    phoneNumber: true,
                                    profilePicture: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }
        else {
            bookings = [];
        }
        res.status(200).json({ success: true, bookings, data: bookings });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
export const updateBookingStatus = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { status } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { babysitter: true, parent: true },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        const isSitter = String(booking.babysitter.userId) === String(userId);
        const isParent = String(booking.parent.userId) === String(userId);
        if (!isSitter && !isParent) {
            return res
                .status(403)
                .json({ message: "Not authorized to update this booking." });
        }
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: status },
            include: { parent: { include: { user: true } } },
        });
        const { sendBookingStatusEmail } = await import("../services/emailService.js");
        if (updatedBooking.parent?.user?.email) {
            sendBookingStatusEmail(updatedBooking.parent.user.email, status);
        }
        res.status(200).json({
            success: true,
            message: `Booking ${status.toLowerCase()}`,
            booking: updatedBooking,
            data: updatedBooking,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Update failed" });
    }
};
export const startSession = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { babysitter: true },
        });
        if (!booking || booking.babysitter.userId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "LIVE",
                actualStart: new Date(),
            },
        });
        res.status(200).json({ success: true, booking: updated });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
export const endSession = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { babysitter: true },
        });
        if (!booking || booking.babysitter.userId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: {
                status: "COMPLETED",
                actualEnd: new Date(),
            },
        });
        res.status(200).json({ success: true, booking: updated });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
export const logGPS = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { lat, lng } = req.body;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        let logs = booking.gpsLogs || [];
        if (!Array.isArray(logs))
            logs = [];
        logs.push({ lat, lng, time: new Date() });
        await prisma.booking.update({
            where: { id: bookingId },
            data: { gpsLogs: logs },
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "GPS Log Error" });
    }
};
export const updateMeetingLink = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { meetingLink } = req.body;
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { babysitter: true },
        });
        if (!booking || booking.babysitter.userId !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        const updated = await prisma.booking.update({
            where: { id: bookingId },
            data: { meetingLink },
            include: {
                parent: { include: { user: true } },
                babysitter: { include: { user: true } },
            },
        });
        const { sendMeetingLinkEmail } = await import("../services/emailService.js");
        if (updated.parent?.user?.email) {
            sendMeetingLinkEmail(updated.parent.user.email, updated.parent.user.name || "Parent", meetingLink, bookingId);
        }
        if (updated.babysitter?.user?.email) {
            sendMeetingLinkEmail(updated.babysitter.user.email, updated.babysitter.user.name || "Babysitter", meetingLink, bookingId);
        }
        res
            .status(200)
            .json({ success: true, booking: updated, message: "Link updated!" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update link" });
    }
};
export const addTip = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { amount } = req.body;
        const userRequest = req.user;
        if (!amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({ message: "Invalid tip amount" });
        }
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { parent: true },
        });
        if (!booking)
            return res.status(404).json({ message: "Booking not found" });
        if (booking.parent.userId !== userRequest.id) {
            return res
                .status(403)
                .json({ message: "Not authorized to tip for this booking" });
        }
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { tipAmount: parseFloat(amount) },
        });
        res.status(200).json({
            success: true,
            message: "Tip added successfully!",
            booking: updatedBooking,
        });
    }
    catch (error) {
        console.error("Add Tip Error:", error);
        res.status(500).json({ message: "Failed to add tip" });
    }
};
export const getSitterEarnings = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const sitter = await prisma.babysitter.findUnique({
            where: { userId },
        });
        if (!sitter) {
            return res.status(404).json({ message: "Sitter profile not found" });
        }
        const bookings = await prisma.booking.findMany({
            where: {
                babysitterId: sitter.id,
                OR: [{ status: "COMPLETED" }, { payment: { status: "COMPLETED" } }],
            },
            include: {
                parent: {
                    include: { user: { select: { name: true, profilePicture: true } } },
                },
                payment: true,
            },
            orderBy: { createdAt: "desc" },
        });
        const totalEarnings = bookings.reduce((sum, booking) => {
            const amount = booking.payment?.status === "COMPLETED"
                ? Number(booking.payment.amount)
                : Number(booking.totalAmount);
            const tip = Number(booking.tipAmount) || 0;
            return sum + amount + tip;
        }, 0);
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        const monthlyEarnings = bookings
            .filter((b) => new Date(b.createdAt) >= startOfMonth)
            .reduce((sum, booking) => {
            const amount = booking.payment?.status === "COMPLETED"
                ? Number(booking.payment.amount)
                : Number(booking.totalAmount);
            const tip = Number(booking.tipAmount) || 0;
            return sum + amount + tip;
        }, 0);
        const transactions = bookings.map((b) => ({
            id: b.id,
            amount: (Number(b.payment?.amount) || Number(b.totalAmount)) +
                Number(b.tipAmount || 0),
            tip: Number(b.tipAmount || 0),
            baseAmount: b.payment?.amount || b.totalAmount,
            date: b.createdAt,
            parentName: b.parent?.user?.name || "Parent",
            parentAvatar: b.parent?.user?.profilePicture,
            status: b.payment?.status || "COMPLETED",
        }));
        res.status(200).json({
            success: true,
            data: {
                totalEarnings,
                monthlyEarnings,
                transactions,
            },
        });
    }
    catch (error) {
        console.error("Earnings Error:", error);
        res.status(500).json({ message: "Failed to fetch earnings data" });
    }
};
