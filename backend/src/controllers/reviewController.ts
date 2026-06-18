import { Request, Response } from "express";
import prisma from "../config/db.js";
import { IUser } from "../types.js";

// @desc    Create a Review for a Booking
// @route   POST /api/reviews
export const createReview = async (req: Request, res: Response) => {
  try {
    const {
      bookingId,
      rating,
      comment,
      punctuality,
      professionalism,
      communication,
    } = req.body;

    const userRequest = req.user as IUser;
    const reviewerId = userRequest.id;

    // 1. Check booking and get sitter details
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId as string) },
      include: { babysitter: true },
    });

    if (!booking || booking.status !== "COMPLETED") {
      return res
        .status(400)
        .json({
          message: "Reviews can only be given after booking is completed.",
        });
    }

    const babysitterId = booking.babysitterId;
    const revieweeUserId = booking.babysitter.userId;

    // 2. Transaction to create review and update sitter stats
    const [review] = await prisma.$transaction([
      prisma.review.create({
        data: {
          bookingId: parseInt(bookingId as string),
          reviewerId: reviewerId,
          revieweeId: revieweeUserId,
          babysitterId: babysitterId,
          rating: parseInt(rating as string),
          comment,
          punctuality: punctuality ? parseInt(punctuality as string) : null,
          professionalism: professionalism ? parseInt(professionalism as string) : null,
          communication: communication ? parseInt(communication as string) : null,
        },
      }),
    ]);

    // 3. Recalculate Sitter Stats
    const allReviews = await prisma.review.findMany({
      where: { babysitterId: babysitterId },
      select: { rating: true },
    });

    const totalRatings = allReviews.length;
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    await prisma.babysitter.update({
      where: { id: babysitterId },
      data: {
        averageRating: parseFloat(avgRating.toFixed(1)),
        totalRatings: totalRatings,
      },
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      data: review,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ message: "You have already reviewed this booking." });
    }
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get Reviews for a Sitter
// @route   GET /api/reviews/sitter/:id
export const getSitterReviews = async (req: Request, res: Response) => {
  try {
    const sitterUserId = parseInt(req.params.id as string);
    const reviews = await prisma.review.findMany({
      where: { revieweeId: sitterUserId },
      include: { 
        user_review_reviewerIdTouser: { select: { name: true } } 
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: "Failed to load reviews" });
  }
};
