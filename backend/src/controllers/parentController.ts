import { Request, Response } from "express";
import prisma from "../config/db.js";

// @desc    Get Parent Profile by User ID
// @route   GET /api/parents/:id
// @access  Public (or Private depending on requirements)
export const getParentById = async (req: Request, res: Response) => {
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
        parent: {
          include: {
            child: true,
          },
        },
      },
    });

    if (!user || !user.parent) {
      return res
        .status(404)
        .json({ success: false, message: "Parent not found" });
    }

    res.status(200).json({ success: true, data: user as any });
  } catch (error) {
    console.error("getParentById Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
