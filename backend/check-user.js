import prisma from "./src/config/db.js";

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
