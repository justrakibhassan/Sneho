import { Request, Response } from "express";
import prisma from "../config/db.js";
import { IUser } from "../types.js";

// @desc    Get Sitter Certifications
// @route   GET /api/user/certifications
export const getCertifications = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;
    const sitter = await prisma.babysitter.findUnique({
      where: { userId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "Sitter profile not found" });
    }

    const certifications = await prisma.certification.findMany({
      where: { babysitterId: sitter.id },
      orderBy: { id: "desc" },
    });

    res.status(200).json({ success: true, certifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch certifications" });
  }
};

// @desc    Add Certification
export const addCertification = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;
    const { title, issuer, issueDate, credentialUrl } = req.body;

    const sitter = await prisma.babysitter.findUnique({
      where: { userId },
    });

    if (!sitter) {
      return res.status(404).json({ message: "Sitter profile not found" });
    }

    const certification = await prisma.certification.create({
      data: {
        babysitterId: sitter.id,
        title,
        issuedBy: issuer,
        issueDate: issueDate ? new Date(issueDate) : null,
        documentUrl: credentialUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: "Certification submitted successfully!",
      certification: certification as any,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add certification" });
  }
};

// @desc    Delete Certification
export const deleteCertification = async (req: Request, res: Response) => {
  try {
    const childId = parseInt(req.params.id as string);
    const userRequest = req.user as IUser;
    const userId = userRequest.id;

    const cert = await prisma.certification.findUnique({
      where: { id: childId },
      include: { babysitter: true },
    });

    if (!cert || cert.babysitter.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.certification.delete({
      where: { id: childId },
    });

    res.status(200).json({ success: true, message: "Certification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete certification" });
  }
};
