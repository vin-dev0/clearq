"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

/**
 * Deletes all demo organizations that have expired.
 */
export async function cleanupExpiredDemos() {
  const now = new Date();
  const expiredOrgs = await prisma.organization.findMany({
    where: {
      isDemo: true,
      expiresAt: {
        lt: now
      }
    },
    select: { id: true }
  });

  if (expiredOrgs.length > 0) {
    console.log(`[DEMO] Cleaning up ${expiredOrgs.length} expired demo organizations`);
    await prisma.organization.deleteMany({
      where: {
        id: {
          in: expiredOrgs.map(org => org.id)
        }
      }
    });
  }
}

/**
 * Sets up a fresh demo environment and returns the credentials.
 */
export async function setupDemo() {
  // Run cleanup first
  await cleanupExpiredDemos();

  const demoEmail = `demo-${uuidv4().slice(0, 8)}@devcomplete.net`;
  const demoPassword = "demo123"; // Simple password for demo
  const passwordHash = await bcrypt.hash(demoPassword, 10);
  
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  const org = await prisma.organization.create({
    data: {
      name: "Acme Support Demo",
      slug: `demo-${uuidv4().slice(0, 8)}`,
      isDemo: true,
      expiresAt,
      plan: "ENTERPRISE",
      subscriptionStatus: "ACTIVE",
      users: {
        create: {
          email: demoEmail,
          name: "Demo Agent",
          passwordHash,
          role: "ADMIN",
          isActive: true,
          plan: "ENTERPRISE",
          subscriptionStatus: "ACTIVE",
        }
      }
    },
    include: {
      users: true
    }
  });

  const user = org.users[0];
  const team = await prisma.team.create({
    data: {
      name: "Global Support",
      description: "Primary support team for the demo",
      organizationId: org.id
    }
  });

  await prisma.teamMember.create({
    data: {
      userId: user.id,
      teamId: team.id,
      role: "admin"
    }
  });

  // Create some sample tickets
  await prisma.ticket.createMany({
    data: [
      {
        number: Math.floor(1000 + Math.random() * 9000),
        subject: "Welcome to your ClearQ Demo!",
        description: "This is a sample ticket to get you started. You have 15 minutes to explore all the features.",
        status: "OPEN",
        priority: "HIGH",
        creatorId: user.id,
        organizationId: org.id,
        teamId: team.id,
      },
      {
        number: Math.floor(1000 + Math.random() * 9000),
        subject: "How do I configure AI auto-responses?",
        description: "I'm looking to automate our first-touch responses using the AI co-pilot.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        creatorId: user.id,
        organizationId: org.id,
        teamId: team.id,
      },
      {
        number: Math.floor(1000 + Math.random() * 9000),
        subject: "Billing inquiry regarding Enterprise plan",
        description: "Can you provide more details on the volume discounts for higher ticket tiers?",
        status: "OPEN",
        priority: "LOW",
        creatorId: user.id,
        organizationId: org.id,
        teamId: team.id,
      }
    ]
  });

  return { email: demoEmail, password: demoPassword };
}
