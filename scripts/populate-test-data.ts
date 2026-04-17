import { PrismaClient } from "@prisma/client";
import { subDays, subMonths, startOfMonth, endOfMonth, endOfDay } from "date-fns";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Populating test data...");
  const hashedPassword = await bcrypt.hash("password", 10);

  // Clear existing
  await prisma.ticket.deleteMany({
    where: { 
      organization: { slug: { in: ["acme-corp", "techstart-io"] } } 
    }
  });
  await prisma.comment.deleteMany({
    where: { 
      author: { email: "bob@techstart.io" } 
    }
  });
  const acme = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      domain: "company.com",
    },
  });

  const techstart = await prisma.organization.upsert({
    where: { slug: "techstart-io" },
    update: {},
    create: {
      name: "TechStart Inc",
      slug: "techstart-io",
      domain: "techstart.io",
    },
  });

  // 2. Create users
  const bob = await prisma.user.upsert({
    where: { email: "bob@techstart.io" },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: "bob@techstart.io",
      name: "Bob Tech",
      role: "AGENT",
      plan: "PRO",
      organizationId: techstart.id,
      passwordHash: hashedPassword,
    },
  });

  /* (Removing automated test tickets as requested)
  const channels = ["WEB", "EMAIL", "CHAT"];
  ...
  */

  console.log("✅ Data population complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
