
import { PrismaClient } from '../src/generated/prisma';
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, organization: { select: { name: true, id: true } } }
  });
  console.log("Users and their Orgs:", users);

  for (const org of await prisma.organization.findMany()) {
      const tickets = await prisma.ticket.count({ where: { organizationId: org.id } });
      const assets = await prisma.asset.count({ where: { organizationId: org.id } });
      const inventory = await prisma.inventory.count({ where: { organizationId: org.id } });
      const usersCount = await prisma.user.count({ where: { organizationId: org.id } });
      console.log(`Org: ${org.name} (${org.id}) -> Tickets: ${tickets}, Assets: ${assets}, Inventory: ${inventory}, Users: ${usersCount}`);
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
