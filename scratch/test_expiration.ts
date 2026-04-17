import { prisma } from "../src/lib/prisma";

async function testExpiration() {
  const org = await prisma.organization.findFirst({
    where: { slug: { not: "demo" } },
    orderBy: { createdAt: "desc" }
  });

  if (!org) {
    console.log("No organization found to test.");
    return;
  }

  console.log(`Setting Org ${org.slug} to EXPIRED (1 day ago)...`);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  await prisma.organization.update({
    where: { id: org.id },
    data: {
      subscriptionEndsAt: yesterday,
      subscriptionStatus: "ACTIVE", // Keeping status ACTIVE but date is PAST ensures we test the dynamic detection
      clientFeePaid: true
    }
  });

  console.log("Done. Refresh the browser. You should be redirected to /subscription-expired.");
}

testExpiration();
