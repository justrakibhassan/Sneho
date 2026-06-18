import prisma from "../config/db.js";
// ===== DISTANCE CALCULATION =====
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
// ===== AVAILABILITY MATCHING =====
/**
 * Check how much parent's required days overlap with sitter's availability
 * @param requiredDays - Parent's required days ["MONDAY", "WEDNESDAY"]
 * @param sitterAvailability - Sitter's availability array
 * @returns Ratio 0-1
 */
function checkAvailabilityOverlap(requiredDays, sitterAvailability) {
    if (!requiredDays || (Array.isArray(requiredDays) && requiredDays.length === 0))
        return 0;
    if (!sitterAvailability || sitterAvailability.length === 0)
        return 0;
    let days = [];
    if (Array.isArray(requiredDays)) {
        days = requiredDays;
    }
    else {
        // Try parsing as JSON first
        try {
            const parsed = JSON.parse(requiredDays);
            if (Array.isArray(parsed)) {
                days = parsed;
            }
            else {
                // If it's a string like "Mon, Tue", turn it into an array
                days = requiredDays.split(/[,;\s]+/).filter(Boolean);
            }
        }
        catch (e) {
            // If parsing fails, it's likely a plain text string like "Mon-Fri" or "Monday, Wednesday"
            days = requiredDays.split(/[,;\s]+/).filter(Boolean);
        }
    }
    const sitterDays = sitterAvailability.map((a) => a.dayOfWeek.toUpperCase());
    // Clean up days to match sitter format (e.g., "MONDAY")
    const normalizedDays = days.map(d => d.trim().toUpperCase());
    const matches = normalizedDays.filter((day) => sitterDays.some(sd => sd.includes(day) || day.includes(sd)));
    return normalizedDays.length > 0 ? matches.length / normalizedDays.length : 0;
}
// ===== PERSONALITY MATCHING =====
/**
 * Match child personality with sitter compatibility
 * @param child - Child object with personality traits
 * @param sitter - Sitter object with compatibility info
 * @returns Score 0-1
 */
function matchPersonality(child, sitter) {
    let score = 0;
    // Energy level compatibility
    if (child.energyLevel && sitter.energyCompatibility) {
        const energyDiff = Math.abs(child.energyLevel - sitter.energyCompatibility);
        score += Math.max(0, 10 - energyDiff); // 0-10 points
    }
    // Special needs handling
    if (child.specialNeeds && sitter.handlesSpecialNeeds) {
        score += 10;
    }
    // Stubbornness handling (experienced sitters for stubborn children)
    if (child.stubbornnessLvl > 7 && sitter.experienceYears >= 3) {
        score += 5;
    }
    return score / 25; // Normalize to 0-1
}
// ===== MAIN MATCHING FUNCTION =====
/**
 * Find and rank matching sitters for a parent
 * @param parentId - Parent ID from database
 * @returns Sorted array of sitters with match scores
 */
export async function findMatchingSitters(parentId) {
    try {
        // 1. Get parent profile with children and preferences
        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                user: true,
                child: true,
            },
        });
        if (!parent) {
            throw new Error("Parent not found");
        }
        // 2. Get all approved sitters with availability
        const sitters = await prisma.babysitter.findMany({
            where: { isApproved: true },
            include: {
                user: true,
                availability: true,
                review: true,
            },
        });
        if (sitters.length === 0) {
            return [];
        }
        // 3. Calculate match scores for each sitter
        const scoredSitters = sitters.map((sitter) => {
            let totalScore = 0;
            const breakdown = {};
            // FACTOR 1: Location Proximity (25%)
            if (parent.latitude &&
                parent.longitude &&
                sitter.latitude &&
                sitter.longitude) {
                const distance = calculateDistance(Number(parent.latitude), Number(parent.longitude), Number(sitter.latitude), Number(sitter.longitude));
                const maxDistance = parent.preferredDistance || 15;
                const locationScore = Math.max(0, (maxDistance - distance) / maxDistance);
                breakdown.location = Math.round(locationScore * 25);
                totalScore += breakdown.location;
            }
            else {
                breakdown.location = 0;
            }
            // FACTOR 2: Availability Alignment (20%)
            if (parent.requiredDays) {
                const availabilityRatio = checkAvailabilityOverlap(parent.requiredDays, sitter.availability);
                breakdown.availability = Math.round(availabilityRatio * 20);
                totalScore += breakdown.availability;
            }
            else {
                breakdown.availability = 0;
            }
            // FACTOR 3: Budget Compatibility (20%)
            if (parent.minBudget && parent.maxBudget) {
                const rate = Number(sitter.hourlyRate);
                if (rate >= parent.minBudget && rate <= parent.maxBudget) {
                    breakdown.budget = 20;
                }
                else if (rate < parent.minBudget) {
                    breakdown.budget = 15; // Under budget is acceptable
                }
                else {
                    const overBudget = rate - parent.maxBudget;
                    breakdown.budget = Math.max(0, 20 - overBudget / 10);
                }
                totalScore += breakdown.budget;
            }
            else {
                breakdown.budget = 0;
            }
            // FACTOR 4: Child Personality Matching (15%)
            if (parent.child && parent.child.length > 0) {
                const personalityScore = matchPersonality(parent.child[0], sitter);
                breakdown.personality = Math.round(personalityScore * 15);
                totalScore += breakdown.personality;
            }
            else {
                breakdown.personality = 0;
            }
            // FACTOR 5: Experience Level (10%)
            const experienceScore = Math.min((sitter.experienceYears || 0) / 5, 1);
            breakdown.experience = Math.round(experienceScore * 10);
            totalScore += breakdown.experience;
            // FACTOR 6: Rating (10%)
            const rating = Number(sitter.averageRating) || 0;
            const ratingScore = rating / 5; // Normalize 5-star to 0-1
            breakdown.rating = Math.round(ratingScore * 10);
            totalScore += breakdown.rating;
            return {
                sitter: {
                    id: sitter.id,
                    userId: sitter.userId,
                    name: sitter.user.name,
                    bio: sitter.bio,
                    hourlyRate: Number(sitter.hourlyRate),
                    experienceYears: sitter.experienceYears,
                    averageRating: Number(sitter.averageRating),
                    totalRatings: sitter.totalRatings,
                    profilePicture: sitter.user.profilePicture,
                    locationAddress: sitter.locationAddress,
                    isApproved: sitter.isApproved,
                },
                matchScore: Math.round(totalScore), // 0-100
                breakdown, // Show why they matched
            };
        });
        // 4. Sort by match score (descending)
        scoredSitters.sort((a, b) => b.matchScore - a.matchScore);
        return scoredSitters;
    }
    catch (error) {
        console.error("Matching Service Error:", error);
        throw error;
    }
}
