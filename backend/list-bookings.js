import prisma from "./src/config/db.js";

async function main() {
  const bookings = await prisma.booking.findMany({
    include: {
      babysitter: {
        include: {
          user: true,
        },
      },
      parent: {
        include: {
          user: true,
        },
      },
    },
  });
  console.log(JSON.stringify(bookings, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
