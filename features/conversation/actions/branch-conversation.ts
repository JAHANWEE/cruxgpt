"use server";

import { requireUser } from "@/features/auth/actions/require-user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function branchConversation(messageId: string) {
  const user = await requireUser();

  // 1. Find the message and its parent conversation
  const branchMessage = await prisma.message.findUnique({
    where: { id: messageId },
    include: { conversation: true },
  });

  if (!branchMessage || branchMessage.conversation.userId !== user.id) {
    throw new Error("Message not found or unauthorized");
  }

  // 2. Fetch all messages up to this point in time
  const historyMessages = await prisma.message.findMany({
    where: {
      conversationId: branchMessage.conversationId,
      createdAt: {
        lte: branchMessage.createdAt,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (historyMessages.length === 0) {
    throw new Error("No history messages found");
  }

  // 3. Create a new conversation (Branch)
  const newConversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: `${branchMessage.conversation.title} (Branch)`,
      systemPrompt: branchMessage.conversation.systemPrompt,
      model: branchMessage.conversation.model,
      forkedFromId: branchMessage.conversationId,
    },
  });

  // 4. Duplicate the messages into the new conversation
  await prisma.message.createMany({
    data: historyMessages.map((msg) => ({
      conversationId: newConversation.id,
      role: msg.role,
      status: msg.status,
      content: msg.content,
      parts: msg.parts ? JSON.parse(JSON.stringify(msg.parts)) : null,
      metadata: msg.metadata ? JSON.parse(JSON.stringify(msg.metadata)) : null,
      createdAt: msg.createdAt, // keep original timeline for proper sorting
    })),
  });

  // Revalidate the home route so the sidebar updates
  revalidatePath("/", "layout");

  // Redirect to the new conversation branch
  redirect(`/c/${newConversation.id}`);
}
