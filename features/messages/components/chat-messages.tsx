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
  const lastMessage = messages.at(-1);
  const hasTextParts = lastMessage?.role === "assistant" && lastMessage.parts.some(
    (part) => part.type === "text" && part.text.length > 0
  );
  
  const isWaiting =
    status === "submitted" ||
    (status === "streaming" && lastMessage?.role === "user") ||
    (status === "streaming" && lastMessage?.role === "assistant" && !hasTextParts);

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
                    <div key={index} className="flex items-center gap-3 w-fit px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-muted-foreground my-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tracking-wide uppercase text-[10px] text-white/50">Searching</span>
                        <span className="max-w-[150px] truncate">{query}</span>
                      </div>
                      {'state' in part && (part.state === 'input-streaming' || part.state === 'input-available') && (
                        <div className="flex items-center gap-1.5 opacity-80">
                          <Loader />
                        </div>
                      )}
                      {'state' in part && part.state === 'done' && (
                        <div className="flex items-center gap-1 text-green-500/80">
                          <span className="size-1.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                          <span className="text-[10px] uppercase font-bold tracking-widest">Done</span>
                        </div>
                      )}
                      {'state' in part && (part.state === 'output-error' || part.state === 'output-denied') && (
                        <div className="flex items-center gap-1 text-red-500/80">
                          <span className="size-1.5 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                          <span className="text-[10px] uppercase font-bold tracking-widest">Failed</span>
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
