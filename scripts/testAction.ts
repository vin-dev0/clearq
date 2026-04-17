import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tickets = await prisma.ticket.findMany();
  console.log("Total tickets found:", tickets.length);
  if (tickets.length > 0) {
    console.log("Ticket 0 ID:", tickets[0].id);
    console.log("Attempting to delete ticket 0...");
    try {
      const res = await prisma.ticket.deleteMany({
        where: { id: { in: [tickets[0].id] } }
      });
      console.log("Delete result:", res);
    } catch (e: any) {
      console.error("Delete failed:", e.message);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
