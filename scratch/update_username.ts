import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.remoteSession.updateMany({
    where: {
      name: { contains: "Thinkpad", mode: 'insensitive' }
    },
    data: {
      username: "Kuai Liang"
    }
  });
  console.log(`Updated ${result.count} sessions.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
