import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Calculate trial dates for demo orgs
  const TRIAL_DAYS = 14;
  const GRACE_PERIOD_DAYS = 3;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const gracePeriodEndsAt = new Date(trialEndsAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // Create demo organizations FIRST (for multi-tenancy)
  // Plan is at ORGANIZATION level - all users in org share the same plan
  const org1 = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: { plan: "PRO", subscriptionStatus: "ACTIVE" },
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      domain: "company.com",
      plan: "PRO",
      subscriptionStatus: "ACTIVE", // Demo org has active subscription
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { slug: "techstart-inc" },
    update: { plan: "PRO", subscriptionStatus: "ACTIVE", trialEndsAt, gracePeriodEndsAt },
    create: {
      name: "TechStart Inc",
      slug: "techstart-inc",
      domain: "techstart.io",
      plan: "PRO",
      subscriptionStatus: "ACTIVE",
      trialEndsAt,
      gracePeriodEndsAt,
    },
  });

  console.log(`✅ Created organizations:`);
  console.log(`   - ${org1.name} (${org1.slug})`);
  console.log(`   - ${org2.name} (${org2.slug})`);

  // Create demo users - ASSIGNED TO ORGANIZATIONS
  const adminPassword = await bcrypt.hash("password456", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  // Acme Corp users
  const admin = await prisma.user.upsert({
    where: { email: "alex@company.com" },
    update: { organizationId: org1.id },
    create: {
      email: "alex@company.com",
      name: "Alex Johnson",
      passwordHash: adminPassword,
      role: "ADMIN",
      plan: "PRO",
      department: "Engineering",
      timezone: "America/New_York",
      organizationId: org1.id, // Multi-tenancy
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "emily@company.com" },
    update: { organizationId: org1.id },
    create: {
      email: "emily@company.com",
      name: "Emily Davis",
      passwordHash: agentPassword,
      role: "AGENT",
      plan: "PRO",
      department: "Support",
      timezone: "America/Los_Angeles",
      organizationId: org1.id, // Multi-tenancy
    },
  });

  const supervisor = await prisma.user.upsert({
    where: { email: "michael@company.com" },
    update: { organizationId: org1.id },
    create: {
      email: "michael@company.com",
      name: "Michael Chen",
      passwordHash: agentPassword,
      role: "SUPERVISOR",
      plan: "PRO",
      department: "Support",
      timezone: "America/Chicago",
      organizationId: org1.id, // Multi-tenancy
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "sarah@company.com" },
    update: { organizationId: org1.id },
    create: {
      email: "sarah@company.com",
      name: "Sarah Wilson",
      passwordHash: customerPassword,
      role: "CLIENT",
      plan: "STARTER",
      timezone: "Europe/London",
      organizationId: org1.id, // Multi-tenancy
    },
  });

  const bobClient = await prisma.user.upsert({
    where: { email: "bob@company.com" },
    update: { organizationId: org1.id },
    create: {
      email: "bob@company.com",
      name: "Bob (Client)",
      passwordHash: customerPassword,
      role: "CLIENT",
      plan: "STARTER",
      timezone: "America/New_York",
      organizationId: org1.id,
    },
  });

  // TechStart Inc users (separate org - should NOT see Acme Corp data)
  const techAdmin = await prisma.user.upsert({
    where: { email: "bob@techstart.io" },
    update: { 
      organizationId: org2.id,
      role: "ADMIN",
      name: "Bob Martinez",
      plan: "PRO"
    },
    create: {
      email: "bob@techstart.io",
      name: "Bob Martinez",
      passwordHash: adminPassword,
      role: "ADMIN",
      plan: "PRO",
      department: "Operations",
      timezone: "America/Denver",
      organizationId: org2.id, // Different org - Multi-tenancy isolation
    },
  });

  const techAgent = await prisma.user.upsert({
    where: { email: "alice@techstart.io" },
    update: { organizationId: org2.id },
    create: {
      email: "alice@techstart.io",
      name: "Alice Smith",
      passwordHash: agentPassword,
      role: "AGENT",
      plan: "PRO",
      department: "Support",
      timezone: "America/Los_Angeles",
      organizationId: org2.id,
    },
  });

  console.log("\n✅ Created users (Acme Corporation):");
  console.log(`   - Admin: ${admin.email} (password: password123)`);
  console.log(`   - Agent: ${agent.email} (password: agent123)`);
  console.log(`   - Supervisor: ${supervisor.email} (password: agent123)`);
  console.log(`   - Customer 1: ${customer.email} (password: customer123)`);
  console.log(`   - Customer 2: ${bobClient.email} (password: customer123)`);
  
  console.log("\n✅ Created users (TechStart Inc):");
  console.log(`   - Admin: ${techAdmin.email} (password: password123)`);
  console.log(`   - Agent: ${techAgent.email} (password: agent123)`);

  // System Owner - FULL CONTROL
  const systemOwner = await prisma.user.upsert({
    where: { email: "owner@simplyticket.com" },
    update: {},
    create: {
      email: "owner@simplyticket.com",
      name: "System Owner",
      passwordHash: adminPassword,
      role: "OWNER",
      plan: "ENTERPRISE",
      timezone: "UTC",
    },
  });

  console.log("\n👑 Created System Owner (Full Control):");
  console.log(`   - Owner: ${systemOwner.email} (password: password123)`);

  const org = org1; // Use org1 for backward compatibility

  // Create demo team
  const team = await prisma.team.upsert({
    where: { id: "team-support" },
    update: {},
    create: {
      id: "team-support",
      name: "Support Team",
      description: "Main customer support team",
      color: "#14b8a6",
      organizationId: org.id,
    },
  });

  console.log(`✅ Created team: ${team.name}`);

  // Add team members
  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: agent.id, teamId: team.id } },
    update: {},
    create: {
      userId: agent.id,
      teamId: team.id,
      role: "member",
    },
  });

  await prisma.teamMember.upsert({
    where: { userId_teamId: { userId: supervisor.id, teamId: team.id } },
    update: {},
    create: {
      userId: supervisor.id,
      teamId: team.id,
      role: "lead",
    },
  });

  console.log("✅ Added team members");

  // Create some demo tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name_organizationId: { name: "bug", organizationId: org.id } },
      update: {},
      create: { name: "bug", color: "#ef4444", organizationId: org.id },
    }),
    prisma.tag.upsert({
      where: { name_organizationId: { name: "feature-request", organizationId: org.id } },
      update: {},
      create: { name: "feature-request", color: "#8b5cf6", organizationId: org.id },
    }),
    prisma.tag.upsert({
      where: { name_organizationId: { name: "urgent", organizationId: org.id } },
      update: {},
      create: { name: "urgent", color: "#f59e0b", organizationId: org.id },
    }),
    prisma.tag.upsert({
      where: { name_organizationId: { name: "billing", organizationId: org.id } },
      update: {},
      create: { name: "billing", color: "#10b981", organizationId: org.id },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create some demo tickets (skip if already exist)
  const existingTickets = await prisma.ticket.count();
  let ticketCount = existingTickets;
  /* (Removing mock data as requested)
  if (existingTickets === 0) {
    const tickets = await Promise.all([
      ...
    ]);
    ticketCount = tickets.length;
  }
  */

  console.log(`✅ ${existingTickets > 0 ? 'Found existing' : 'Created'} ${ticketCount} demo tickets`);

  // (Removing mock chat data as requested)
  /*
  const generalChannel = await prisma.chatRoom.upsert({ ... });
  ...
  */

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

