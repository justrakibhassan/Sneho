import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/db.js";
import { sendResetPasswordEmail } from "../services/emailService.js";
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email.",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "USER",
                sitterStatus: "NONE",
                isApproved: true,
            },
        });
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        const { password: _, ...userData } = newUser;
        res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            user: userData,
        });
    }
    catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error during registration.",
        });
    }
};
// --- LOGIN USER ---
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // 1. Find User
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // 2. Check Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // 3. Generate JWT Token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // 4. Send Response (Hide password)
        const { password: _, ...userData } = user;
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userData,
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// @desc    Register a new Sitter (Pending Approval)
// @route   POST /api/auth/register-sitter
// @access  Public
export const registerSitter = async (req, res) => {
    try {
        const { name, email, password, phone, location, experience, hourlyRate, bio, dob, gender, skills, profilePicture, } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered. Please login.",
            });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                profilePicture: profilePicture || null,
                phoneNumber: phone,
                role: "USER",
                sitterStatus: "PENDING",
                babysitter: {
                    create: {
                        locationAddress: location,
                        experienceYears: experience,
                        hourlyRate: hourlyRate,
                        bio: bio,
                        dob: new Date(dob),
                        gender: gender,
                        skills: skills,
                    },
                },
            },
            include: {
                babysitter: true,
            },
        });
        res.status(201).json({
            success: true,
            message: "Application submitted successfully! Please wait for admin approval.",
            userId: newUser.id,
        });
    }
    catch (error) {
        console.error("Sitter Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration.",
            error: error.message,
        });
    }
};
// @desc    Apply as Sitter (For Existing Users)
// @route   POST /api/auth/apply-as-sitter
// @access  Private (Requires Authentication)
export const applyAsSitter = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const { experience, hourlyRate, bio, skills, location, gender, dob, phoneNumber, profilePicture, } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { babysitter: true },
        });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        if (user.sitterStatus === "APPROVED") {
            return res.status(400).json({
                success: false,
                message: "You are already an approved sitter.",
            });
        }
        if (user.sitterStatus === "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Your application is already pending review.",
            });
        }
        const errors = [];
        if (!experience)
            errors.push("Experience is required");
        if (!hourlyRate)
            errors.push("Hourly rate is required");
        if (!bio)
            errors.push("Bio is required");
        if (!skills)
            errors.push("Skills are required");
        if (!location)
            errors.push("Location is required");
        if (!gender)
            errors.push("Gender is required");
        if (!dob)
            errors.push("Date of Birth is required");
        if (!phoneNumber && !user.phoneNumber)
            errors.push("Phone number is required");
        if (!profilePicture && !user.profilePicture)
            errors.push("Profile picture is required");
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors,
            });
        }
        const userUpdateData = {
            sitterStatus: "PENDING",
        };
        if (phoneNumber)
            userUpdateData.phoneNumber = phoneNumber;
        if (profilePicture)
            userUpdateData.profilePicture = profilePicture;
        await prisma.user.update({
            where: { id: userId },
            data: userUpdateData,
        });
        const sitterData = {
            bio,
            experienceYears: parseInt(experience),
            hourlyRate: parseFloat(hourlyRate),
            locationAddress: location,
            gender,
            dob: new Date(dob),
            skills,
            isApproved: false,
        };
        if (user.babysitter) {
            await prisma.babysitter.update({
                where: { userId },
                data: sitterData,
            });
        }
        else {
            await prisma.babysitter.create({
                data: {
                    ...sitterData,
                    userId,
                },
            });
        }
        res.status(201).json({
            success: true,
            message: "Application submitted successfully! Pending admin approval.",
        });
    }
    catch (error) {
        console.error("Apply as Sitter Error:", error);
        res
            .status(500)
            .json({ success: false, message: "Server error", error: error.message });
    }
};
// --- FORGOT PASSWORD ---
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Security: Do not reveal if user exists.
            return res.status(200).json({ success: true, message: "If an account exists with this email, a password reset link has been sent." });
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expiry,
            },
        });
        await sendResetPasswordEmail(user.email, resetToken);
        res.status(200).json({ success: true, message: "Password reset link sent to your email." });
    }
    catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Server error during password reset request." });
    }
};
// --- RESET PASSWORD ---
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });
        res.status(200).json({ success: true, message: "Password reset successful. You can now login with your new password." });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Server error during password reset." });
    }
};
