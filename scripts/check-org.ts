import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organization.findUnique({ where: { id: "cmn5dj4sh0001ue7dnqvmtz6g" } });
  console.log(JSON.stringify(org, null, 2));
}
main().finally(() => prisma.$disconnect());
