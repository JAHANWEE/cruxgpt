"use client";

import { isTextUIPart, type UIMessage } from "ai";
import type { ChatStatus } from "ai";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import { cn } from "@/lib/utils";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { BranchButton } from "./branch-button";

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
};

export function ChatMessages({ messages, status }: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => (
          <Message key={message.id} from={message.role} className="group relative">
            <MessageContent>
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return <MessageResponse key={index}>{part.text}</MessageResponse>;
                } else if (part.type.startsWith("tool-")) {
                  // In AI SDK v7, part type is tool-${toolName} and args are in part.input
                  const input = ('input' in part) ? part.input : ('args' in part ? part.args : {});
                  const query = input && typeof input === 'object' && 'query' in input 
                    ? String(input.query) 
                    : '...';
                  return (
                    <div key={index} className="flex flex-col gap-2 p-3 bg-muted/50 rounded-md text-sm my-2 border">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Web Search</span>
                        <span>{query}</span>
                      </div>
                      {'state' in part && (part.state === 'input-streaming' || part.state === 'input-available') && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Loader /> Fetching results...
                        </div>
                      )}
                      {'state' in part && (part.state === 'output-available' || part.state === 'error') && (
                        <div className="text-xs text-green-600 dark:text-green-500">
                          ✓ Completed
                        </div>
                      )}
                      {'state' in part && part.state === 'error' && (
                        <div className="text-xs text-red-600 dark:text-red-500">
                          ✕ Failed to fetch
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </MessageContent>
            
            {/* Show branch button only on user/assistant messages, outside the content bubble */}
            <div className={cn(
              "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
              message.role === "user" ? "-left-10" : "-right-10"
            )}>
              <BranchButton messageId={message.id} />
            </div>
          </Message>
        ))}

        {isWaiting ? (
          <Message from="assistant">
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
   
    </Conversation>
  );
}
