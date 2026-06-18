import { Request, Response } from "express";
import { StreamClient } from "@stream-io/node-sdk";

export const generateMeetingToken = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const apiKey = process.env.STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET_KEY;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ message: "Stream API keys are missing on server" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const client = new StreamClient(apiKey, apiSecret);
    const token = client.generateUserToken({ user_id: userId.toString() });

    console.log("✅ Token Generated Successfully for User:", userId);

    res.json({ success: true, token });

  } catch (error: any) {
    console.error("❌ Token Generation Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
