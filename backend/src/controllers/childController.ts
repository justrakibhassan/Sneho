import { Request, Response } from "express";
import prisma from "../config/db.js";
import { IUser } from "../types.js";

// @desc    Add a new child
// @route   POST /api/children
// @access  Private (Parent Only)
export const addChild = async (req: Request, res: Response) => {
  try {
    const { name, age, gender, specialNeeds, stubbornnessLvl, interests } =
      req.body;
    const userRequest = req.user as IUser;
    const userId = userRequest.id;

    // Find or create parent profile
    let parentProfile = await prisma.parent.findUnique({
      where: { userId: userId },
    });

    if (!parentProfile) {
      parentProfile = await prisma.parent.create({
        data: { userId: userId },
      });

      // Update user role to PARENT
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PARENT" },
      });
    }

    // Create child
    const newChild = await prisma.child.create({
      data: {
        parentId: parentProfile.id,
        name,
        age: parseInt(age),
        gender,
        specialNeeds,
        stubbornnessLvl: parseInt(stubbornnessLvl),
        interests: interests,
        // Matching Algorithm Fields
        energyLevel: req.body.energyLevel ? parseInt(req.body.energyLevel) : 5,
        temperament: req.body.temperament || "Moderate",
      },
    });

    res.status(201).json({
      success: true,
      message: "Child added successfully!",
      child: newChild,
    });
  } catch (error: any) {
    console.error("Add Child Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding child.",
      error: error.message,
    });
  }
};

// @desc    Get all children of logged-in parent
// @route   GET /api/children
// @access  Private (Parent Only)
export const getMyChildren = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;

    // Find or create parent profile
    let parentProfile = await prisma.parent.findUnique({
      where: { userId: userId },
    });

    // Auto-create parent profile if it doesn't exist
    if (!parentProfile) {
      parentProfile = await prisma.parent.create({
        data: {
          userId: userId,
        },
      });

      // Also update user role to PARENT
      await prisma.user.update({
        where: { id: userId },
        data: { role: "PARENT" },
      });
    }

    // Get all children for this parent
    const children = await prisma.child.findMany({
      where: { parentId: parentProfile.id },
      orderBy: { id: "desc" },
    });

    res.status(200).json({
      success: true,
      children,
    });
  } catch (error: any) {
    console.error("Get Children Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching children.",
      error: error.message,
    });
  }
};

// @desc    Delete a child
// @route   DELETE /api/children/:id
// @access  Private
export const deleteChild = async (req: Request, res: Response) => {
  try {
    const childId = parseInt(req.params.id as string);

    await prisma.child.delete({
      where: { id: childId },
    });

    res.status(200).json({ success: true, message: "Child profile deleted." });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to delete child.",
      error: error.message,
    });
  }
};

// @desc    Update child profile
// @route   PUT /api/children/:id
export const updateChild = async (req: Request, res: Response) => {
  try {
    const childId = parseInt(req.params.id as string);
    const { name, age, gender, specialNeeds, stubbornnessLvl, interests } =
      req.body;

    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: {
        name,
        age: parseInt(age),
        gender,
        specialNeeds,
        stubbornnessLvl: parseInt(stubbornnessLvl),
        interests,
        // Matching Algorithm Fields
        energyLevel: req.body.energyLevel
          ? parseInt(req.body.energyLevel)
          : undefined,
        temperament: req.body.temperament,
      },
    });

    res.status(200).json({
      success: true,
      message: "Child profile updated!",
      child: updatedChild,
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update child.",
      error: error.message,
    });
  }
};
