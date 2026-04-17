import { PrismaClient } from "@prisma/client";
import { sendInviteEmail } from "@/lib/mail";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args.find(a => a.startsWith("--email="))?.split("=")[1] || "test-agent@example.com";
  
  console.log(`Starting invitation test for: ${email}`);

  // 1. Get or create a test organization
  let org = await prisma.organization.findFirst({
    where: { slug: "test-org" }
  });

  if (!org) {
    console.log("Creating test organization...");
    org = await prisma.organization.create({
      data: {
        name: "Test Organization",
        slug: "test-org",
      }
    });
  }

  // 2. Get a user to act as the "sender"
  let sender = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "OWNER"] } }
  });

  if (!sender) {
    console.log("No admin user found. Creating a temporary test admin...");
    sender = await prisma.user.create({
      data: {
        email: "admin-sender@example.com",
        name: "Test Admin",
        role: "ADMIN",
        organizationId: org.id
      }
    });
  }

  // 3. Generate Invite Code
  const code = `TEST-${randomBytes(3).toString("hex").toUpperCase()}`;
  
  console.log(`Generating invite record with code: ${code}...`);
  const invite = await prisma.inviteCode.create({
    data: {
      code,
      email,
      organizationId: org.id,
      createdById: sender.id,
      maxUses: 1,
      type: "DIRECT",
    }
  });

  // 4. Trigger Email Sending (Mocked)
  console.log("Triggering email delivery logic...");
  const result = await sendInviteEmail(email, code, org.name);

  console.log("\n--- TEST COMPLETED SUCCESSFULLY ---");
  console.log(`Invite ID: ${invite.id}`);
  console.log(`Invite Code: ${code}`);
  console.log(`Email Mock Location: ${result.filePath}`);
  console.log("\nYou can now open this file in your browser to verify the email content!");
}

main()
  .catch(e => {
    console.error("\n--- TEST FAILED ---");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
