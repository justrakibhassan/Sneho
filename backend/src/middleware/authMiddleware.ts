import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { IUser } from "../types.js";

interface DecodedToken {
  id: number;
  iat: number;
  exp: number;
}

// @desc    Protect routes (Verify JWT Token)
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      // Get user from the token (database check)
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          isApproved: true,
        },
      });

      // User check
      if (!user) {
        return res
          .status(401)
          .json({ message: "Not authorized, user not found" });
      }

      req.user = user as IUser;

      // Success: Go to next middleware
      next();
    } catch (error: any) {
      console.error("Token Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    // 2. If no token found (else block for safety)
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// @desc    Admin only middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// @desc    Parent only middleware
export const parentOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "PARENT") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a parent" });
  }
};

// @desc    Babysitter only middleware
export const sitterOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "BABYSITTER") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as a babysitter" });
  }
};
