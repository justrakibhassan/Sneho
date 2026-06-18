import prisma from "./src/config/db.js";
import bcrypt from "bcrypt";

async function seed() {
  const password = "12345678";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log("Seeding started...");

  // Ensure Admin exists/updated
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: hashedPassword, role: "ADMIN", isApproved: true, isVerified: true },
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      isApproved: true,
      isVerified: true
    }
  });
  console.log("Admin account ensured.");

  // Seed 20 Parents
  for (let i = 1; i <= 20; i++) {
    const email = `parent${i}@test.com`;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { parent: true }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `Parent Account ${i}`,
          role: "PARENT",
          isApproved: true,
          isVerified: true,
          parent: {
            create: {
              locationAddress: `Address ${i}, Dhaka`,
              situation: `Looking for a sitter for my children. Level ${i}`,
              child: {
                create: [
                  { name: `Child ${i}A`, age: Math.floor(Math.random() * 10) + 1 },
                  { name: `Child ${i}B`, age: Math.floor(Math.random() * 10) + 1 }
                ]
              }
            }
          }
        }
      });
      console.log(`Parent ${i} created.`);
    } else {
      console.log(`Parent ${i} already exists.`);
    }
  }

  // Seed 20 Sitters
  for (let i = 1; i <= 20; i++) {
    const email = `sitter${i}@test.com`;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { babysitter: true }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `Sitter Account ${i}`,
          role: "BABYSITTER",
          isApproved: true,
          isVerified: true,
          sitterStatus: "APPROVED",
          babysitter: {
            create: {
              bio: `Experienced sitter with years of practice. Profile ${i}`,
              experienceYears: Math.floor(Math.random() * 10) + 1,
              hourlyRate: 150 + (i * 10),
              locationAddress: `Sitter Area ${i}, Dhaka`,
              isApproved: true
            }
          }
        }
      });
      console.log(`Sitter ${i} created.`);
    } else {
      await prisma.user.update({
        where: { email },
        data: { sitterStatus: "APPROVED" }
      });
      console.log(`Sitter ${i} updated.`);
    }
  }

  console.log("Seeding completed successfully!");
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
