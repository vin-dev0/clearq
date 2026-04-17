import { prisma } from "../lib/prisma";

async function cleanup() {
  console.log("Searching for CLIENT users in Teams...");
  
  const teamMembers = await prisma.teamMember.findMany({
    include: {
      user: true,
      team: true
    }
  });

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" }
  });

  console.log(`Found ${clients.length} total clients.`);

  for (const client of clients) {
    // Remove from all teams
    const teamMemberships = await prisma.teamMember.deleteMany({
      where: { userId: client.id }
    });
    if (teamMemberships.count > 0) {
      console.log(`Removed ${client.name || client.email} from ${teamMemberships.count} teams.`);
    }

    // Remove from all chat rooms
    const chatMemberships = await prisma.chatRoomMember.deleteMany({
      where: { userId: client.id }
    });
    if (chatMemberships.count > 0) {
      console.log(`Removed ${client.name || client.email} from ${chatMemberships.count} chat rooms.`);
    }
  }

  console.log("Cleanup complete.");
}

cleanup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
