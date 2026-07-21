"use client";

import type { ComponentProps, HTMLAttributes } from "react";
import { memo } from "react";
import type { UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

import { cn } from "@/lib/utils";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full max-w-[95%] flex-col gap-2",
      from === "user" ? "is-user ml-auto items-end" : "is-assistant",
      className
    )}
    {...props}
  />
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement>;

export const MessageContent = ({
  children,
  className,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(
      "flex w-fit max-w-[90%] min-w-0 flex-col gap-3 overflow-hidden text-[15px] leading-relaxed tracking-wide",
      "group-[.is-user]:rounded-[24px] group-[.is-user]:bg-secondary group-[.is-user]:px-5 group-[.is-user]:py-3.5 group-[.is-user]:text-secondary-foreground group-[.is-user]:shadow-sm group-[.is-user]:border group-[.is-user]:border-white/5",
      "group-[.is-assistant]:text-foreground/90 group-[.is-assistant]:mt-2",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type MessageResponseProps = ComponentProps<typeof Streamdown>;

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown
      plugins={{ code }}
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

MessageResponse.displayName = "MessageResponse";
