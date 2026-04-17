import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const org = await prisma.organization.update({
    where: { slug: "techstart-io" },
    data: {
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
    }
  });
  console.log("Updated Organization:", JSON.stringify(org, null, 2));

  const user = await prisma.user.update({
    where: { email: "bob@techstart.io" },
    data: {
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
    }
  });
  console.log("Updated User:", JSON.stringify(user, null, 2));
}
main().finally(() => prisma.$disconnect());
