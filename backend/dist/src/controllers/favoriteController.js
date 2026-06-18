import prisma from "../config/db.js";
// @desc    Toggle favorite status of a sitter
// @route   POST /api/favorites/toggle
// @access  Private (Parent Only)
export const toggleFavorite = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const { babysitterId } = req.body;
        if (!babysitterId) {
            return res.status(400).json({ message: "Babysitter ID is required" });
        }
        const parent = await prisma.parent.findUnique({
            where: { userId },
        });
        if (!parent) {
            return res.status(404).json({ message: "Parent profile not found" });
        }
        const sitterIdInt = parseInt(babysitterId);
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                parentId_babysitterId: {
                    parentId: parent.id,
                    babysitterId: sitterIdInt,
                },
            },
        });
        if (existingFavorite) {
            await prisma.favorite.delete({
                where: { id: existingFavorite.id },
            });
            return res.status(200).json({
                success: true,
                message: "Removed from favorites",
                isFavorited: false,
            });
        }
        else {
            await prisma.favorite.create({
                data: {
                    parentId: parent.id,
                    babysitterId: sitterIdInt,
                },
            });
            return res.status(201).json({
                success: true,
                message: "Added to favorites",
                isFavorited: true,
            });
        }
    }
    catch (error) {
        console.error("Toggle Favorite Error:", error);
        if (error.code === 'P2003') {
            return res.status(400).json({
                success: false,
                message: "Relationship mismatch. Sitter or Parent profile might be missing.",
                debug: { babysitterId: req.body.babysitterId }
            });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};
// @desc    Get all favorite sitters for a parent
// @route   GET /api/favorites
// @access  Private (Parent Only)
export const getFavorites = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const parent = await prisma.parent.findUnique({
            where: { userId },
        });
        if (!parent) {
            // Return empty favorites instead of 404 for new parents
            return res.status(200).json({
                success: true,
                favorites: [],
            });
        }
        const favorites = await prisma.favorite.findMany({
            where: { parentId: parent.id },
            include: {
                babysitter: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profilePicture: true,
                                email: true,
                                phoneNumber: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json({
            success: true,
            favorites: favorites.map((f) => f.babysitter),
        });
    }
    catch (error) {
        console.error("Get Favorites Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// @desc    Check if a sitter is favorited
// @route   GET /api/favorites/check/:babysitterId
// @access  Private (Parent Only)
export const checkFavorite = async (req, res) => {
    try {
        const userRequest = req.user;
        const userId = userRequest.id;
        const babysitterId = parseInt(req.params.babysitterId);
        if (!babysitterId) {
            return res.status(400).json({ message: "Babysitter ID is required" });
        }
        const parent = await prisma.parent.findUnique({
            where: { userId },
        });
        if (!parent) {
            return res.status(404).json({ message: "Parent profile not found" });
        }
        const favorite = await prisma.favorite.findUnique({
            where: {
                parentId_babysitterId: {
                    parentId: parent.id,
                    babysitterId,
                },
            },
        });
        res.status(200).json({
            success: true,
            isFavorited: !!favorite,
        });
    }
    catch (error) {
        console.error("Check Favorite Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
