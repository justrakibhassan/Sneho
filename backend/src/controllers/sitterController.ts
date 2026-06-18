import { Request, Response } from "express";
import prisma from "../config/db.js";
import { IUser } from "../types.js";

// @route   POST /api/sitters/availability
// @desc    Update Availability
export const updateAvailability = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;
    const { schedule } = req.body;

    const sitterProfile = await prisma.babysitter.findUnique({
      where: { userId: userId },
    });

    if (!sitterProfile)
      return res.status(404).json({ message: "Sitter profile not found" });

    await prisma.availability.deleteMany({
      where: { babysitterId: sitterProfile.id },
    });

    if (schedule && schedule.length > 0) {
      const formattedData = schedule.map((item: any) => ({
        babysitterId: sitterProfile.id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      }));

      await prisma.availability.createMany({
        data: formattedData,
      });
    }

    res.status(200).json({ success: true, message: "Availability updated!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get All Sitters (With Filters)
// @route   GET /api/sitters
export const getSitters = async (req: Request, res: Response) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      minExp,
      minRating,
      skills,
      gender,
      page = 1,
      limit = 10,
    } = req.query as any;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let filterClause: any = {
      role: "BABYSITTER",
      isApproved: true,
    };

    if (
      location ||
      minPrice ||
      maxPrice ||
      minExp ||
      minRating ||
      skills ||
      gender
    ) {
      filterClause.babysitter = {
        ...(location && {
          locationAddress: {
            contains: location,
          },
        }),
        ...(minPrice && { hourlyRate: { gte: parseFloat(minPrice) } }),
        ...(maxPrice && { hourlyRate: { lte: parseFloat(maxPrice) } }),
        ...(minExp && { experienceYears: { gte: parseInt(minExp) } }),
        ...(minRating && { averageRating: { gte: parseFloat(minRating) } }),
        ...(gender && { gender: gender }),
        ...(skills && {
          AND: skills.split(",").map((skill: string) => ({
            skills: { contains: skill.trim() },
          })),
        }),
      };
    }

    const [sitters, total] = await Promise.all([
      prisma.user.findMany({
        where: filterClause,
        skip,
        take,
        select: {
          id: true,
          name: true,
          profilePicture: true,
          babysitter: {
            select: {
              id: true,
              bio: true,
              hourlyRate: true,
              locationAddress: true,
              experienceYears: true,
              averageRating: true,
              totalRatings: true,
              availability: true,
            },
          },
        },
      }),
      prisma.user.count({ where: filterClause }),
    ]);

    res.status(200).json({ success: true, sitters, total });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Single Sitter by User ID
// @route   GET /api/sitters/:id
export const getSitterById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id as string);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        createdAt: true,
        babysitter: {
          include: {
            availability: true,
            review: {
              include: {
                user_review_reviewerIdTouser: {
                  select: {
                    name: true,
                    profilePicture: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!user || !user.babysitter) {
      return res.status(404).json({ message: "Sitter not found" });
    }

    res.status(200).json({ success: true, data: user as any });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get My Availability
// @route   GET /api/sitters/availability
export const getMyAvailability = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;

    const sitter = await prisma.babysitter.findUnique({
      where: { userId: userId },
      include: { availability: true },
    });

    if (!sitter)
      return res.status(404).json({ message: "Sitter profile not found" });

    res.status(200).json({ success: true, schedule: sitter.availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
