import prisma from "../config/db.js";
import { StreamChat } from "stream-chat";
// @desc    Get All Conversations for User
// @route   GET /api/messages/conversations
export const getConversations = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const role = userRequest.role;
        let bookings;
        if (role === "PARENT") {
            const parent = await prisma.parent.findUnique({ where: { userId } });
            if (!parent)
                return res.status(200).json({ success: true, conversations: [] });
            bookings = await prisma.booking.findMany({
                where: { parentId: parent.id },
                select: {
                    id: true,
                    conversation: {
                        include: { message: { take: 1, orderBy: { createdAt: "desc" } } },
                    },
                    babysitter: { include: { user: true } },
                },
            });
        }
        else {
            const sitter = await prisma.babysitter.findUnique({ where: { userId } });
            if (!sitter)
                return res.status(200).json({ success: true, conversations: [] });
            bookings = await prisma.booking.findMany({
                where: { babysitterId: sitter.id },
                select: {
                    id: true,
                    conversation: {
                        include: { message: { take: 1, orderBy: { createdAt: "desc" } } },
                    },
                    parent: { include: { user: true } },
                },
            });
        }
        const conversations = bookings.map((b) => ({
            bookingId: b.id,
            conversationId: b.conversation?.id || null,
            otherUser: role === "PARENT" ? b.babysitter.user : b.parent.user,
            lastMessage: b.conversation?.message[0] || null,
        }));
        res.status(200).json({ success: true, conversations });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
// @desc    Get Messages for a Booking (Conversation)
export const getMessages = async (req, res) => {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const userRequest = req.user;
        const userId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                babysitter: true,
                parent: true,
            },
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.babysitter.userId !== userId &&
            booking.parent.userId !== userId) {
            return res
                .status(403)
                .json({ message: "Not authorized to view these messages" });
        }
        let conversation = await prisma.conversation.findUnique({
            where: { bookingId },
            include: {
                message: {
                    orderBy: { createdAt: "asc" },
                    include: { user_message_senderIdTouser: { select: { id: true, name: true } } },
                },
            },
        });
        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }
        res.status(200).json({ success: true, messages: conversation.message });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
// @desc    Send a Message
export const sendMessage = async (req, res) => {
    try {
        const { bookingId, content } = req.body;
        const userRequest = req.user;
        const senderId = userRequest.id;
        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(bookingId) },
            include: { babysitter: true, parent: true },
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        if (booking.parent.userId !== senderId &&
            booking.babysitter.userId !== senderId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        let conversation = await prisma.conversation.findUnique({
            where: { bookingId: parseInt(bookingId) },
        });
        if (!conversation) {
            const u1 = Math.min(booking.parent.userId, booking.babysitter.userId);
            const u2 = Math.max(booking.parent.userId, booking.babysitter.userId);
            conversation = await prisma.conversation.create({
                data: {
                    bookingId: parseInt(bookingId),
                    user1Id: u1,
                    user2Id: u2,
                },
            });
        }
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId,
                content,
                isRead: false,
                receiverId: senderId === booking.parent.userId
                    ? booking.babysitter.userId
                    : booking.parent.userId,
            },
            include: { user_message_senderIdTouser: { select: { id: true, name: true } } },
        });
        res.status(201).json({ success: true, message: message });
    }
    catch (error) {
        res.status(500).json({ message: "Message sending failed" });
    }
};
// @desc    Generate Stream Chat Token
export const getStreamChatToken = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id.toString();
        const apiKey = process.env.STREAM_API_KEY;
        const apiSecret = process.env.STREAM_SECRET_KEY;
        if (!apiKey || !apiSecret) {
            return res.status(500).json({
                success: false,
                message: "Stream Chat credentials not configured",
            });
        }
        const serverClient = StreamChat.getInstance(apiKey, apiSecret);
        const token = serverClient.createToken(userId);
        res.status(200).json({
            success: true,
            token,
            apiKey,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate chat token",
        });
    }
};
// @desc    Create or Get a Conversation by User IDs
export const createOrGetConversation = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const userRequest = req.user;
        const currentUserId = userRequest.id;
        if (!targetUserId) {
            return res.status(400).json({ message: "Target User ID is required" });
        }
        if (parseInt(targetUserId) === currentUserId) {
            return res.status(400).json({ message: "Cannot chat with yourself" });
        }
        const u1 = Math.min(currentUserId, parseInt(targetUserId));
        const u2 = Math.max(currentUserId, parseInt(targetUserId));
        let conversation = await prisma.conversation.findUnique({
            where: {
                user1Id_user2Id: {
                    user1Id: u1,
                    user2Id: u2,
                },
            },
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    user1Id: u1,
                    user2Id: u2,
                },
            });
        }
        const channelId = `conv-${conversation.id}-${new Date(conversation.createdAt).getTime()}`;
        res.status(200).json({
            success: true,
            data: conversation,
            channelId,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};
