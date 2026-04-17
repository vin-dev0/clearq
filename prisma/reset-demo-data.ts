import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDemoData() {
  console.log("🗑️  Starting demo data cleanup...\n");

  try {
    // Delete in order to respect foreign key constraints
    
    // Delete join requests
    const deletedJoinRequests = await prisma.joinRequest.deleteMany({});
    console.log(`✓ Deleted ${deletedJoinRequests.count} join requests`);

    // Delete invite codes
    const deletedInviteCodes = await prisma.inviteCode.deleteMany({});
    console.log(`✓ Deleted ${deletedInviteCodes.count} invite codes`);

    // Delete assets
    const deletedAssets = await prisma.asset.deleteMany({});
    console.log(`✓ Deleted ${deletedAssets.count} assets`);

    // Delete chat messages
    const deletedMessages = await prisma.chatMessage.deleteMany({});
    console.log(`✓ Deleted ${deletedMessages.count} chat messages`);

    // Delete chat room members
    const deletedChatRoomMembers = await prisma.chatRoomMember.deleteMany({});
    console.log(`✓ Deleted ${deletedChatRoomMembers.count} chat room members`);

    // Delete chat rooms
    const deletedChatRooms = await prisma.chatRoom.deleteMany({});
    console.log(`✓ Deleted ${deletedChatRooms.count} chat rooms`);

    // Delete access logs
    const deletedAccessLogs = await prisma.accessLog.deleteMany({});
    console.log(`✓ Deleted ${deletedAccessLogs.count} access logs`);

    // Delete activity logs
    const deletedActivityLogs = await prisma.activityLog.deleteMany({});
    console.log(`✓ Deleted ${deletedActivityLogs.count} activity logs`);

    // Delete notifications
    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`✓ Deleted ${deletedNotifications.count} notifications`);

    // Delete ticket watchers
    const deletedWatchers = await prisma.ticketWatcher.deleteMany({});
    console.log(`✓ Deleted ${deletedWatchers.count} ticket watchers`);

    // Delete ticket tags
    const deletedTicketTags = await prisma.ticketTag.deleteMany({});
    console.log(`✓ Deleted ${deletedTicketTags.count} ticket tags`);

    // Delete attachments
    const deletedAttachments = await prisma.attachment.deleteMany({});
    console.log(`✓ Deleted ${deletedAttachments.count} attachments`);

    // Delete comments
    const deletedComments = await prisma.comment.deleteMany({});
    console.log(`✓ Deleted ${deletedComments.count} comments`);

    // Delete tickets
    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`✓ Deleted ${deletedTickets.count} tickets`);

    // Delete tags
    const deletedTags = await prisma.tag.deleteMany({});
    console.log(`✓ Deleted ${deletedTags.count} tags`);

    // Delete SLA rules
    const deletedSlaRules = await prisma.sLARule.deleteMany({});
    console.log(`✓ Deleted ${deletedSlaRules.count} SLA rules`);

    // Delete articles
    const deletedArticles = await prisma.article.deleteMany({});
    console.log(`✓ Deleted ${deletedArticles.count} articles`);

    // Delete article categories
    const deletedArticleCategories = await prisma.articleCategory.deleteMany({});
    console.log(`✓ Deleted ${deletedArticleCategories.count} article categories`);

    // Delete saved views
    const deletedSavedViews = await prisma.savedView.deleteMany({});
    console.log(`✓ Deleted ${deletedSavedViews.count} saved views`);

    // Delete team members
    const deletedTeamMembers = await prisma.teamMember.deleteMany({});
    console.log(`✓ Deleted ${deletedTeamMembers.count} team members`);

    // Delete teams
    const deletedTeams = await prisma.team.deleteMany({});
    console.log(`✓ Deleted ${deletedTeams.count} teams`);

    // Delete organizations
    const deletedOrganizations = await prisma.organization.deleteMany({});
    console.log(`✓ Deleted ${deletedOrganizations.count} organizations`);

    // Delete sessions and accounts
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.verificationToken.deleteMany({});
    console.log("✓ Deleted all auth sessions and accounts");

    // Delete ALL users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${deletedUsers.count} users (including OAuth)`);
    
    console.log("\n✅ Database completely cleared!\n");

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetDemoData()
  .then(() => {
    console.log("\n🎉 Database reset successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to reset database:", error);
    process.exit(1);
  });

