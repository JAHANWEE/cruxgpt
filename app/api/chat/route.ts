import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
  isStepCount,
} from "ai";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

import { getChatModel } from "@/features/ai/utils/models";
import { requireUser } from "@/features/auth/actions/require-user";
import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { prisma } from "@/lib/db";

export const maxDuration = 30;

/**
 * Search the web using Serper.dev (Google Search API).
 * Free tier: 2,500 queries, no credit card needed.
 * Sign up at https://serper.dev to get an API key.
 *
 * Falls back to a "no API key configured" message if SERPER_API_KEY is not set.
 */
async function webSearch(query: string): Promise<{ title: string; url: string; snippet: string }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY is not configured. Get a free key at https://serper.dev");
  }

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });

  if (!res.ok) {
    throw new Error(`Serper API returned ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const organic = data.organic ?? [];
  return organic.slice(0, 5).map((r: { title: string; link: string; snippet: string }) => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet ?? "",
  }));
}

export async function POST(req: Request) {
  await auth.protect();

  const { message, id }: { message: UIMessage; id: string } = await req.json();

  if (!message || !id) {
    return new Response("Missing message or conversation id", { status: 400 });
  }

  const user = await requireUser();
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: user.id },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const previousMessages = await loadChatMessages(id);
  const alreadySaved = previousMessages.some(
    (storedMessage) => storedMessage.id === message.id
  );
  const messages = alreadySaved
    ? previousMessages
    : [...previousMessages, message];

  if (!alreadySaved) {
    await saveChatMessages(id, [message]);
  }

  const webSearchTool = tool({
    description: "Search the web for real-time information",
    inputSchema: z.object({
      query: z.string().describe("The search query"),
    }),
    execute: async ({ query }) => {
      console.log("[web_search] Tool called with query:", query);
      try {
        if (!query || query.trim() === "") {
          return { error: "Please provide a valid search query" };
        }
        const results = await webSearch(query);
        console.log("[web_search] Success, got", results.length, "results:", JSON.stringify(results).slice(0, 150));
        return results;
      } catch (e) {
        console.error("[web_search] ERROR:", e);
        return { error: "Failed to fetch search results" };
      }
    },
  });

  const tools = { web_search: webSearchTool };

  const result = streamText({
    model: getChatModel(conversation.model),
    system: `${conversation.systemPrompt ?? "You are CruxGPT, a helpful assistant."} The current date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(3),
    tools,
    onStepFinish: (step) => {
      console.log(`[step] Step finished. Text generated: "${step.text}", tool calls:`, step.toolCalls.map(tc => tc.toolName));
    },
    onFinish: (event) => {
      console.log(`[streamText onFinish] Overall finish reason: ${event.finishReason}, Text: "${event.text}"`);
    }
  });

  // removed result.consumeStream() to prevent draining the stream
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onEnd: async ({ messages: finalMessages }) => {
        try {
          await saveChatMessages(id, finalMessages, { updateTitle: false });
        } catch (error) {
          console.error("Failed to save chat messages", error);
        }
      },
    }),
  });
}
