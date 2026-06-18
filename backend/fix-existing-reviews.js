import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fixReviews() {
  console.log("🚀 Starting Review Data Fix (ESM)...");

  try {
    // 1. Get all reviews that don't have babysitterId
    const reviewsToFix = await prisma.review.findMany({
      where: { babysitterId: null },
      include: {
        booking: true,
      },
    });

    console.log(`🔍 Found ${reviewsToFix.length} reviews to fix.`);

    for (const review of reviewsToFix) {
      if (review.booking && review.booking.babysitterId) {
        await prisma.review.update({
          where: { id: review.id },
          data: { babysitterId: review.booking.babysitterId },
        });
        console.log(
          `✅ Fixed review ${review.id} with babysitterId ${review.booking.babysitterId}`
        );
      }
    }

    // 2. Recalculate Average Rating and Total Ratings for all sitters
    const sitters = await prisma.babysitter.findMany();
    console.log(`🔄 Recalculating ratings for ${sitters.length} sitters...`);

    for (const sitter of sitters) {
      const allReviews = await prisma.review.findMany({
        where: { babysitterId: sitter.id },
        select: { rating: true },
      });

      const totalRatings = allReviews.length;
      if (totalRatings > 0) {
        const avgRating =
          allReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        await prisma.babysitter.update({
          where: { id: sitter.id },
          data: {
            averageRating: parseFloat(avgRating.toFixed(1)),
            totalRatings: totalRatings,
          },
        });
        console.log(
          `⭐ Updated Sitter ${sitter.id}: Rating ${avgRating.toFixed(
            1
          )}, Total ${totalRatings}`
        );
      } else {
        await prisma.babysitter.update({
          where: { id: sitter.id },
          data: {
            averageRating: 0.0,
            totalRatings: 0,
          },
        });
        console.log(`ℹ️ Reset Sitter ${sitter.id}: No reviews.`);
      }
    }

    console.log("🏁 Review Data Fix Completed!");
  } catch (error) {
    console.error("❌ Error fixing reviews:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReviews();
