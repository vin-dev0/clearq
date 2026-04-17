import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();

async function main() {
  const organizations = await prisma.organization.findMany();
  if (organizations.length === 0) {
    console.log("No organizations found. Please create one first.");
    return;
  }

  for (const org of organizations) {
    const orgId = org.id;
    console.log(`Seeding data for organization: ${org.name} (${orgId})`);



    // 2. Seed Macros (Templates)
    const templates = [
      {
        name: "General Greeting",
        type: "ticket",
        subject: "Hello {{customer_name}}",
        content: "Hello {{customer_name}},\n\nThank you for reaching out. We have received your request regarding '{{ticket_subject}}' and our team is looking into it.\n\nBest regards,\n{{agent_name}}",
        category: "Greetings",
        organizationId: orgId
      },
      {
        name: "Resolution Confirmation",
        type: "ticket",
        subject: "Issue Resolved: {{ticket_subject}}",
        content: "Hi {{customer_name}},\n\nWe believe the issue you reported has been resolved. Please let us know if you have any further questions!\n\nBest regards,\n{{agent_name}}",
        category: "Closing",
        organizationId: orgId
      }
    ];

    for (const t of templates) {
      await prisma.template.upsert({
        where: { id: `seed-${t.name}-${orgId}` }, // Use a predictable ID for upsert or just create
        update: t,
        create: { ...t, id: `seed-${t.name}-${orgId}` },
      });
    }

  }
  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
