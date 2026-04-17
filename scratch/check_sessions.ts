import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.remoteSession.findMany();
  console.log(JSON.stringify(sessions, null, 2));
}

main().catch(console.error);
