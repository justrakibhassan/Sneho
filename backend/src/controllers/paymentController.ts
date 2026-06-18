import { Request, Response } from "express";
import prisma from "../config/db.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { IUser } from "../types.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const parseBookingId = (bookingId: unknown) => {
  const parsed = Number.parseInt(String(bookingId), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getBookingAmountInCents = (totalAmount: { toString: () => string }) =>
  Math.round(Number.parseFloat(totalAmount.toString()) * 100);

// @desc    Create Stripe Payment Intent
export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const { bookingId } = req.body;
    const parsedBookingId = parseBookingId(bookingId);

    if (!parsedBookingId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
      include: {
        parent: { include: { user: true } },
      },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.parent.userId !== userRequest.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pay for this booking",
      });
    }

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending bookings can be paid.",
      });
    }

    const existingCompletedPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    });

    if (existingCompletedPayment?.status === "COMPLETED") {
      return res.status(409).json({
        success: false,
        message: "This booking has already been paid.",
      });
    }

    const amountInCents = getBookingAmountInCents(booking.totalAmount);

    if (amountInCents <= 0) {
      return res.status(400).json({
        success: false,
        message: "Booking amount must be greater than 0",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "bdt",
      metadata: {
        bookingId: booking.id.toString(),
        parentId: booking.parentId.toString(),
        parentUserId: booking.parent.userId.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      amount: booking.totalAmount,
    });
  } catch (error: any) {
    console.error("Stripe Intent Error:", error);
    res.status(500).json({
      success: false,
      message: "Payment initialization failed",
      error: error.message,
    });
  }
};

// @desc    Confirm Payment and record in DB
export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const { bookingId, transactionId, paymentIntentId } = req.body;
    const parsedBookingId = parseBookingId(bookingId);
    const stripePaymentIntentId = transactionId || paymentIntentId;

    if (!parsedBookingId || !stripePaymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and payment intent ID are required",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsedBookingId },
      include: { parent: true },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.parent.userId !== userRequest.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to confirm payment for this booking",
      });
    }

    const paymentIntent =
      await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: "Payment has not succeeded.",
      });
    }

    if (paymentIntent.metadata.bookingId !== booking.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Payment does not match this booking.",
      });
    }

    if (paymentIntent.metadata.parentUserId !== booking.parent.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Payment does not match this parent account.",
      });
    }

    const expectedAmount = getBookingAmountInCents(booking.totalAmount);
    if (
      paymentIntent.amount !== expectedAmount ||
      paymentIntent.currency.toLowerCase() !== "bdt"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount or currency does not match the booking.",
      });
    }

    const paidAmount = paymentIntent.amount / 100;

    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        transactionId: paymentIntent.id,
        amount: paidAmount,
        status: "COMPLETED",
        method: "STRIPE",
        paymentDate: new Date(),
      },
      create: {
        bookingId: booking.id,
        transactionId: paymentIntent.id,
        amount: paidAmount,
        status: "COMPLETED",
        method: "STRIPE",
        paymentDate: new Date(),
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
      },
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment as any,
    });
  } catch (error: any) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  }
};

// @desc    Get Payment History
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userRequest = req.user as IUser;
    const userId = userRequest.id;
    const role = userRequest.role;

    let payments: any[] = [];

    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({ where: { userId } });
      if (parent) {
        payments = await prisma.payment.findMany({
          where: { booking: { parentId: parent.id } },
          include: {
            booking: {
              include: {
                babysitter: { include: { user: { select: { name: true } } } },
              },
            },
          },
          orderBy: { paymentDate: "desc" },
        });
      }
    } else if (role === "BABYSITTER") {
      const sitter = await prisma.babysitter.findUnique({ where: { userId } });
      if (sitter) {
        payments = await prisma.payment.findMany({
          where: { booking: { babysitterId: sitter.id } },
          include: {
            booking: {
              include: {
                parent: { include: { user: { select: { name: true } } } },
              },
            },
          },
          orderBy: { paymentDate: "desc" },
        });
      }
    }

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error("Payment History Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment history" });
  }
};
