import { Server } from "socket.io";
import { initSessionSocket, startDurationBroadcast } from "./sessionSocketService.js";
let io;
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all origins for now, restrict in production
            methods: ["GET", "POST"],
        },
    });
    // Initialize session tracking sockets
    initSessionSocket(io);
    // Start periodic duration broadcasts
    startDurationBroadcast();
    io.on("connection", (socket) => {
        // --- User Events ---
        // User joins their own support room
        socket.on("join_support_room", (userId) => {
            socket.join(`support_${userId}`);
        });
        // Explicit request for agent
        socket.on("request_agent", (data) => {
            const { userId, userName } = data;
            io.to("admin_room").emit("admin_notification", {
                userId,
                userName: userName || "Anonymous User",
                message: "User requested to speak with an agent",
                timestamp: new Date(),
            });
        });
        // User sends a message
        socket.on("send_message", ({ userId, userName, message, isAgentActive }) => {
            if (!isAgentActive) {
                // BOT LOGIC
                setTimeout(() => {
                    let botReply = "I am a bot. Type 'agent' to speak to a human.";
                    const lowerMsg = message.toLowerCase();
                    // --- Improved Bot Responses ---
                    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
                        botReply =
                            "Hello! 👋 Welcome to CareConnect. Ask me about our **Services**, **Pricing**, **Safety**, or how to **Book** a sitter!";
                    }
                    else if (lowerMsg.includes("services")) {
                        botReply =
                            "We offer:\n1. **Babysitting**: Trusted care for your little ones.\n2. **Housekeeping**: Professional help for your home.\n3. **Pet Care**: Loving care for your furry friends.";
                    }
                    else if (lowerMsg.includes("safety") ||
                        lowerMsg.includes("secure")) {
                        botReply =
                            "Safety is our priority! 🛡️ All sitters undergo **ID verification** and **background checks**. We also offer secure payments and insurance coverage.";
                    }
                    else if (lowerMsg.match(/how.*work/) ||
                        lowerMsg.includes("guide")) {
                        botReply =
                            "It's simple:\n1. **Search**: Find sitters near you.\n2. **Book**: Request a time & date.\n3. **Pay**: Securely pay through the app after the job is done.";
                    }
                    else if (lowerMsg.includes("pricing") ||
                        lowerMsg.includes("cost")) {
                        botReply =
                            "Our pricing is transparent:\n- **Sitters set their own rates** (avg. $10-20/hr).\n- **Service Fee**: Small percentage for platform safety.\n- No hidden subscription fees!";
                    }
                    else if (lowerMsg.includes("book") || lowerMsg.includes("hire")) {
                        botReply =
                            "To book a sitter: Go to **Find a Sitter**, view a profile, and click **'Book Now'**. It takes less than 2 minutes! ⏳";
                    }
                    else if (lowerMsg.includes("agent") ||
                        lowerMsg.includes("human") ||
                        lowerMsg.includes("help")) {
                        botReply =
                            "Connecting you to a human agent... 🎧 Please wait a moment.";
                        // Notify admins
                        io.to("admin_room").emit("admin_notification", {
                            userId,
                            userName: userName || "Anonymous User",
                            message: "User requests an agent.",
                            timestamp: new Date(),
                        });
                    }
                    io.to(`support_${userId}`).emit("receive_message", {
                        sender: "bot",
                        message: botReply,
                        timestamp: new Date(),
                    });
                }, 800);
            }
            else {
                // Forward to Admin with userName
                io.to("admin_room").emit("admin_receive_message", {
                    userId,
                    userName: userName || "Anonymous User",
                    message,
                    timestamp: new Date(),
                });
            }
        });
        // --- Admin Events ---
        // Admin joins the global admin room to receive notifications
        socket.on("admin_join", () => {
            socket.join("admin_room");
        });
        // Admin replies to a specific user
        socket.on("admin_reply", ({ userId, message }) => {
            io.to(`support_${userId}`).emit("receive_message", {
                sender: "agent",
                message,
                timestamp: new Date(),
            });
        });
        socket.on("disconnect", () => {
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
