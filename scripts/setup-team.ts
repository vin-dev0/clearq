/**
 * Setup Team Script
 * 
 * This script sets up a user with an organization and team members for testing.
 * 
 * Usage: npx tsx scripts/setup-team.ts <user-email>
 * Example: npx tsx scripts/setup-team.ts lycan@example.com
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const userEmail = process.argv[2];

  if (!userEmail) {
    console.error("❌ Usage: npx tsx scripts/setup-team.ts <user-email>");
    process.exit(1);
  }

  console.log(`\n🔍 Looking for user: ${userEmail}\n`);

  // Find the user
  const user = await prisma.user.findUnique({
    where: { email: userEmail.toLowerCase() },
    include: { organization: true },
  });

  if (!user) {
    console.error(`❌ User not found: ${userEmail}`);
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`);
  console.log(`   Current role: ${user.role}`);
  console.log(`   Current org: ${user.organization?.name || "None"}`);

  // If user doesn't have an organization, create one
  let organization = user.organization;
  if (!organization) {
    console.log("\n📦 Creating organization for user...\n");
    
    const orgName = `${user.name || user.email.split("@")[0]}'s Team`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    
    // Plan is at ORGANIZATION level - all users in org share this plan
    organization = await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        plan: "PRO",
        subscriptionStatus: "ACTIVE",
      },
    });

    // Update user with org and make them TEAM_LEAD
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: organization.id,
        role: "TEAM_LEAD",
      },
    });

    console.log(`✅ Created organization: ${organization.name}`);
    console.log(`✅ Updated ${user.name} to TEAM_LEAD role`);
  } else {
    // Update user to TEAM_LEAD if not already
    if (!["TEAM_LEAD", "ADMIN", "OWNER"].includes(user.role)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "TEAM_LEAD" },
      });
      console.log(`✅ Updated ${user.name} to TEAM_LEAD role`);
    }
  }

  // Create demo team members
  console.log("\n👥 Creating demo team members...\n");
  
  const demoPassword = await bcrypt.hash("demo123", 10);
  
  const demoMembers = [
    { email: "demo.agent@team.local", name: "Demo Agent", role: "AGENT", department: "Support" },
    { email: "demo.supervisor@team.local", name: "Demo Supervisor", role: "SUPERVISOR", department: "Operations" },
    { email: "demo.customer@team.local", name: "Demo Customer", role: "CUSTOMER", department: "Sales" },
  ];

  for (const member of demoMembers) {
    const existingMember = await prisma.user.findUnique({
      where: { email: member.email },
    });

    if (existingMember) {
      // Update to same organization
      await prisma.user.update({
        where: { id: existingMember.id },
        data: { organizationId: organization.id },
      });
      console.log(`✅ Updated ${member.name} to organization`);
    } else {
      await prisma.user.create({
        data: {
          email: member.email,
          name: member.name,
          passwordHash: demoPassword,
          role: member.role as any,
          department: member.department,
          plan: "PRO",
          organizationId: organization.id,
        },
      });
      console.log(`✅ Created ${member.name} (${member.email})`);
    }
  }

  // Create default chat room for team
  const existingRoom = await prisma.chatRoom.findFirst({
    where: {
      organizationId: organization.id,
      name: "General",
    },
  });

  if (!existingRoom) {
    await prisma.chatRoom.create({
      data: {
        name: "General",
        description: "General team discussion",
        type: "PUBLIC",
        organizationId: organization.id,
        createdById: user.id,
      },
    });
    console.log("\n💬 Created #general chat room");
  }

  console.log("\n✅ Setup complete!");
  console.log("\n📋 Demo credentials (password: demo123):");
  for (const member of demoMembers) {
    console.log(`   - ${member.email}`);
  }
  console.log("\n💡 To test multi-tenancy, log in as different users.");
  console.log("   Team members from the same organization will appear in:");
  console.log("   - Team Chat (Messaging page)");
  console.log("   - Settings → Organization");
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


