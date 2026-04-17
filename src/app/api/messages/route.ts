import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInAppNotification } from "@/lib/actions/notifications";

// GET - Fetch messages for a chat room or direct messages
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role;

  if (userRole === "CLIENT") {
    return NextResponse.json({ error: "Access denied: Clients cannot access Team Chat" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const chatRoomId = searchParams.get("chatRoomId");
  const receiverId = searchParams.get("receiverId");
  const limit = parseInt(searchParams.get("limit") || "50");
  const cursor = searchParams.get("cursor");

  try {
    if (chatRoomId) {
      // Fetch channel messages
      const messages = await prisma.chatMessage.findMany({
        where: { chatRoomId },
        orderBy: { createdAt: "desc" },
        take: limit,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      });

      return NextResponse.json({ messages: messages.reverse() });
    } else if (receiverId) {
      // Fetch direct messages between two users
      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId },
            { senderId: receiverId, receiverId: userId },
          ],
          chatRoomId: null,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // Mark messages as read
      await prisma.chatMessage.updateMany({
        where: {
          senderId: receiverId,
          receiverId: userId,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ messages: messages.reverse() });
    }

    return NextResponse.json({ error: "Missing chatRoomId or receiverId" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST - Send a new message (with organization validation)
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userRole = (session.user as any).role;
  const organizationId = (session.user as any).organizationId;

  if (userRole === "CLIENT") {
    return NextResponse.json({ error: "Access denied: Clients cannot access Team Chat" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { content, chatRoomId, receiverId, replyToId, attachment } = body;

    // Must have either content or attachment
    if (!content?.trim() && !attachment?.url) {
      return NextResponse.json({ error: "Message content or attachment is required" }, { status: 400 });
    }

    // Multi-tenancy: Verify receiver is in same organization (for direct messages)
    if (receiverId && organizationId) {
      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
        select: { organizationId: true },
      });
      
      if (!receiver || receiver.organizationId !== organizationId) {
        return NextResponse.json({ error: "Cannot message users outside your organization" }, { status: 403 });
      }
    }

    // Multi-tenancy: Verify chatRoom is in same organization (for channel messages)
    if (chatRoomId && organizationId) {
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        select: { organizationId: true },
      });
      
      if (!chatRoom || (chatRoom.organizationId && chatRoom.organizationId !== organizationId)) {
        return NextResponse.json({ error: "Cannot access chat rooms outside your organization" }, { status: 403 });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content?.trim() || "",
        senderId: userId,
        chatRoomId: chatRoomId || null,
        receiverId: receiverId || null,
        replyToId: replyToId || null,
        // Attachment fields
        attachmentUrl: attachment?.url || null,
        attachmentName: attachment?.name || null,
        attachmentType: attachment?.type || null,
        attachmentSize: attachment?.size || null,
      },
    });

    // Notifications logic
    try {
      const sender = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      });

      if (receiverId) {
        // Direct Message Notification
        await createInAppNotification({
          userId: receiverId,
          type: "CHAT_MESSAGE",
          title: "New Message",
          message: `${sender?.name || sender?.email} sent you a message: "${content?.substring(0, 50)}${content?.length > 50 ? "..." : ""}"`,
          link: "/messaging", // Or a specific chat link if available
          metadata: { senderId: userId, messageId: message.id }
        });
      } else if (chatRoomId) {
        // Chat Room Notification
        const room = await prisma.chatRoom.findUnique({
          where: { id: chatRoomId },
          select: { name: true, members: { select: { userId: true } } }
        });

        if (room) {
          const membersToNotify = room.members.filter(m => m.userId !== userId);
          for (const member of membersToNotify) {
            await createInAppNotification({
              userId: member.userId,
              type: "CHAT_MESSAGE",
              title: `#${room.name}`,
              message: `${sender?.name || sender?.email}: ${content?.substring(0, 50)}${content?.length > 50 ? "..." : ""}`,
              link: `/messaging`, // Or a specific room link
              metadata: { chatRoomId, messageId: message.id }
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to create chat notification:", e);
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

