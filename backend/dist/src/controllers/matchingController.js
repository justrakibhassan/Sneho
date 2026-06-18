import { findMatchingSitters } from "../services/matchingService.js";
import prisma from "../config/db.js";
// @desc    Find matching sitters for logged-in parent
// @route   GET /api/matching/find-sitters
// @access  Private (Parent only)
export const getMatchingSitters = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { parent: true },
        });
        if (!user?.parent) {
            return res.status(404).json({
                success: false,
                message: "Parent profile not found. Only parents can use matching.",
            });
        }
        const matches = await findMatchingSitters(user.parent.id);
        res.status(200).json({
            success: true,
            matches,
            total: matches.length,
            message: matches.length > 0
                ? `Found ${matches.length} matching sitters!`
                : "No matching sitters found. Try updating your preferences.",
        });
    }
    catch (error) {
        console.error("Matching Error:", error);
        res.status(500).json({
            success: false,
            message: "Error finding matches",
            error: error.message,
        });
    }
};
