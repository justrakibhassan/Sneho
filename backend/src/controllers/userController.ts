import { Request, Response } from "express";
import prisma from "../config/db.js";
import { IUser } from "../types.js";

// @desc    Update user profile (Handles both Parent & Babysitter)
// @route   PUT /api/user/update-profile
// @access  Private
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user.id;
    const userRole = user.role;

    // 1. Common Data
    const {
      name,
      phone,
      profilePicture,
      // Parent Specific
      location,
      minBudget,
      maxBudget,
      situation,
      // Babysitter Specific
      bio,
      experienceYears,
      hourlyRate,
    } = req.body;

    let updateData: any = {
      name,
      phoneNumber: phone,
      profilePicture,
    };

    // 2. Role-specific data update logic
    if (
      userRole === "PARENT" ||
      (userRole === "USER" && (location || minBudget || maxBudget))
    ) {
      // Auto-upgrade role to PARENT for new users completing their profile
      if (userRole === "USER") {
        updateData.role = "PARENT";
      }

      updateData.parent = {
        upsert: {
          create: {
            locationAddress: location,
            minBudget: parseFloat(minBudget) || 0,
            maxBudget: parseFloat(maxBudget) || 0,
            situation: situation,
            requiredDays: req.body.requiredDays,
            latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
            longitude: req.body.longitude
              ? parseFloat(req.body.longitude)
              : null,
            preferredDistance: req.body.preferredDistance
              ? parseInt(req.body.preferredDistance)
              : 10,
            preferredGender: req.body.preferredGender,
          },
          update: {
            locationAddress: location,
            minBudget: parseFloat(minBudget) || 0,
            maxBudget: parseFloat(maxBudget) || 0,
            situation: situation,
            requiredDays: req.body.requiredDays,
            latitude: req.body.latitude
              ? parseFloat(req.body.latitude)
              : undefined,
            longitude: req.body.longitude
              ? parseFloat(req.body.longitude)
              : undefined,
            preferredDistance: req.body.preferredDistance
              ? parseInt(req.body.preferredDistance)
              : undefined,
            preferredGender: req.body.preferredGender,
          },
        },
      };
    } else if (userRole === "BABYSITTER") {
      updateData.babysitter = {
        upsert: {
          create: {
            locationAddress: location,
            bio: bio,
            experienceYears: parseInt(experienceYears) || 0,
            hourlyRate: parseFloat(hourlyRate) || 0,
            latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
            longitude: req.body.longitude
              ? parseFloat(req.body.longitude)
              : null,
            dob: req.body.dob ? new Date(req.body.dob) : null,
            gender: req.body.gender,
            skills: req.body.skills,
            preferredAgeGroup: req.body.preferredAgeGroup,
            handlesSpecialNeeds: req.body.handlesSpecialNeeds
              ? Boolean(req.body.handlesSpecialNeeds)
              : false,
            energyCompatibility: req.body.energyCompatibility
              ? parseInt(req.body.energyCompatibility)
              : 5,
          },
          update: {
            locationAddress: location,
            bio: bio,
            experienceYears: parseInt(experienceYears) || 0,
            hourlyRate: parseFloat(hourlyRate) || 0,
            latitude: req.body.latitude
              ? parseFloat(req.body.latitude)
              : undefined,
            longitude: req.body.longitude
              ? parseFloat(req.body.longitude)
              : undefined,
            dob: req.body.dob ? new Date(req.body.dob) : undefined,
            gender: req.body.gender,
            skills: req.body.skills,
            preferredAgeGroup: req.body.preferredAgeGroup,
            handlesSpecialNeeds:
              req.body.handlesSpecialNeeds !== undefined
                ? Boolean(req.body.handlesSpecialNeeds)
                : undefined,
            energyCompatibility: req.body.energyCompatibility
              ? parseInt(req.body.energyCompatibility)
              : undefined,
          },
        },
      };
    }

    // 3. Prisma Query (Nested Update)
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // 4. Response
    const { password, ...userResponse } = updatedUser as any;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: userResponse,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const user = await prisma.user.findUnique({
      where: { id: userRequest.id },
      include: {
        parent: {
          include: { child: true },
        },
        babysitter: {
          include: { availability: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userResponse } = user as any;

    res.status(200).json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/user/dashboard-stats
// @access  Private
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;
    const role = userRequest.role;

    let stats = {
      bookingsCount: 0,
      rating: 0,
      balance: 0,
      sessionsCount: 0,
    };

    if (role === "PARENT") {
      let parent = await prisma.parent.findUnique({
        where: { userId },
      });

      // Auto-create if missing
      if (!parent) {
        parent = await prisma.parent.create({
          data: { userId },
        });
      }

      if (parent) {
        stats.bookingsCount = await prisma.booking.count({
          where: { parentId: parent.id },
        });

        stats.sessionsCount = await prisma.session.count({
          where: { parentId: parent.id, status: "COMPLETED" },
        });

        const bookings = await prisma.booking.findMany({
          where: { parentId: parent.id, status: "COMPLETED" },
          select: { totalAmount: true },
        });
        const totalSpent = bookings.reduce(
          (sum, b) => sum + (parseFloat(b.totalAmount.toString()) || 0),
          0
        );
        stats.balance = totalSpent;
      }
    } else if (role === "BABYSITTER") {
      const sitter = await prisma.babysitter.findUnique({
        where: { userId },
      });

      if (sitter) {
        stats.bookingsCount = await prisma.booking.count({
          where: { babysitterId: sitter.id },
        });

        stats.rating = sitter.averageRating || 0;

        stats.sessionsCount = await prisma.session.count({
          where: { sitterId: sitter.id, status: "COMPLETED" },
        });

        const completedBookings = await prisma.booking.findMany({
          where: { babysitterId: sitter.id, status: "COMPLETED" },
          select: { totalAmount: true },
        });
        stats.balance = completedBookings.reduce(
          (sum, b) => sum + (parseFloat(b.totalAmount.toString()) || 0),
          0
        );
      }
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get dashboard stats" });
  }
};

// @desc    Get recent activity
// @route   GET /api/user/recent-activity
// @access  Private
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;
    const role = userRequest.role;
    let activities: any[] = [];

    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({
        where: { userId },
      });

      if (parent) {
        // Get recent bookings
        const bookings = await prisma.booking.findMany({
          where: { parentId: parent.id },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            babysitter: {
              include: { user: true },
            },
          },
        });

        activities = bookings.map((booking: any) => ({
          id: booking.id,
          type: "Booking",
          description: `Booking with ${
            booking.babysitter.user.name
          } for ${new Date(booking.startTime).toLocaleDateString()}`,
          timestamp: booking.createdAt,
          status: booking.status,
        }));

        // Get recent sessions
        const sessions = await prisma.session.findMany({
          where: { parentId: parent.id },
          take: 3,
          orderBy: { startTime: "desc" },
          include: {
            sitter: {
              include: { user: true },
            },
          },
        });

        const sessionActivities = sessions.map((session: any) => ({
          id: `session-${session.id}`,
          type: "Session",
          description: `Session with ${session.sitter.user.name}`,
          timestamp: session.startTime,
          status: session.status,
        }));

        activities = [...activities, ...sessionActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
      }
    } else if (role === "BABYSITTER") {
      const sitter = await prisma.babysitter.findUnique({
        where: { userId },
      });

      if (sitter) {
        // Get recent bookings
        const bookings = await prisma.booking.findMany({
          where: { babysitterId: sitter.id },
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            parent: {
              include: { user: true },
            },
          },
        });

        activities = bookings.map((booking: any) => ({
          id: booking.id,
          type: "Booking",
          description: `Booking request from ${
            booking.parent.user.name
          } for ${new Date(booking.startTime).toLocaleDateString()}`,
          timestamp: booking.createdAt,
          status: booking.status,
        }));

        // Get recent sessions
        const sessions = await prisma.session.findMany({
          where: { sitterId: sitter.id },
          take: 3,
          orderBy: { startTime: "desc" },
          include: {
            parent: {
              include: { user: true },
            },
          },
        });

        const sessionActivities = sessions.map((session: any) => ({
          id: `session-${session.id}`,
          type: "Session",
          description: `Session with ${session.parent.user.name}`,
          timestamp: session.startTime,
          status: session.status,
        }));

        activities = [...activities, ...sessionActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5);
      }
    }

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get recent activity",
    });
  }
};
