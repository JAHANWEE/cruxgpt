"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Returns the signed-in app user from our database.
 * Uses auth.protect() so Server Actions reject unauthenticated callers.
 */
export async function requireUser() {
  const { userId } = await auth.protect();

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    const { onBoard } = await import("./onboard");
    user = await onBoard();
  }

  return user;
}
