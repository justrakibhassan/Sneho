import { Request, Response } from "express";
import prisma from "../config/db.js";

// @desc    Get all system settings
// @route   GET /api/admin/settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.systemconfig.findMany();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    res.status(200).json({ success: true, settings: settingsObj });
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    const updatePromises = Object.entries(updates).map(([key, value]) => {
      return prisma.systemconfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updatePromises);

    res
      .status(200)
      .json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get maintenance status (public)
// @route   GET /api/system/maintenance
export const getMaintenanceStatus = async (req: Request, res: Response) => {
  try {
    const setting = await prisma.systemconfig.findUnique({
      where: { key: "MAINTENANCE_MODE" },
    });

    res.status(200).json({
      success: true,
      maintenanceMode: setting?.value === "true",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
