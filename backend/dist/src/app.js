import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import prisma from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import childRoutes from "./routes/childRoutes.js";
import sitterRoutes from "./routes/sitterRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import emergencyContactRoutes from "./routes/emergencyContactRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import { checkMaintenanceMode } from "./middleware/maintenanceMiddleware.js";
const app = express();
// --- Security: Rate Limiting ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        message: "Too many attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const allowedOrigins = [
    "http://localhost:3000",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
].filter(Boolean);
// --- Middlewares ---
app.use(express.json());
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked for origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Stricter CSP and safety headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "res.cloudinary.com", "images.unsplash.com"],
            connectSrc: ["'self'", "http://localhost:5000", "*.stream-io-api.com"],
        },
    },
}));
app.use("/api/", apiLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use(checkMaintenanceMode);
// Attach io to requests
app.use((req, res, next) => {
    import("./services/socketService.js").then((m) => {
        try {
            req.io = m.getIO();
        }
        catch (e) {
            // socket not ready yet
        }
        next();
    });
});
// --- Route Mounting ---
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/children", childRoutes);
app.use("/api/sitters", sitterRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/emergency-contacts", emergencyContactRoutes);
app.use("/api/favorites", favoriteRoutes);
// --- Health Check ---
app.get("/", (req, res) => {
    res.send("Sneho API is running successfully! 🚀");
});
app.get("/ping", (req, res) => {
    res.send("pong 🏓");
});
// --- Database Connection Check ---
const connectDB = async () => {
    try {
        await prisma.$connect();
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};
connectDB();
export default app;
