import prisma from "./src/config/db.js";

async function createSitterProfile() {
  try {
    // Get user 3 (the logged-in sitter)
    const user = await prisma.user.findUnique({
      where: { id: 3 },
      include: { babysitter: true },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    if (user.babysitter) {
      console.log("Sitter profile already exists!");
      return;
    }

    // Create babysitter profile
    const sitter = await prisma.babysitter.create({
      data: {
        userId: 3,
        bio: "Experienced babysitter",
        experienceYears: 2,
        hourlyRate: 150,
        locationAddress: "Dhaka, Bangladesh",
      },
    });

    console.log("✅ Sitter profile created successfully!");
    console.log(sitter);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSitterProfile();
