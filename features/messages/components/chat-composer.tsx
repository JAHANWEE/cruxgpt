"use client";

import * as React from "react";
import { ArrowUpIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ChatComposerProps = {
  onSend: (content: string) => Promise<void> | void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export function ChatComposer({
  onSend,
  isSending = false,
  placeholder = "Message CruxGPT…",
  className,
  autoFocus = false,
}: ChatComposerProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const content = value.trim();
    if (!content || isSending) return;

    setValue("");
    await onSend(content);
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  const canSend = value.trim().length > 0 && !isSending;

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className={cn("mx-auto w-full max-w-3xl px-4 pb-6 md:px-6 z-10", className)}
    >
      <InputGroup className="h-auto min-h-14 rounded-full border border-white/5 bg-neutral-900/40 glass shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-300 focus-within:ring-1 focus-within:ring-white/20">
        <InputGroupTextarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isSending}
          rows={1}
          className="max-h-48 min-h-12 py-3.5 pl-4 text-[15px] leading-relaxed"
        />
        <InputGroupAddon align="inline-end" className="pr-2 pb-2 self-end">
          <InputGroupButton
            type="submit"
            size="icon-sm"
            variant="secondary"
            disabled={!canSend}
            className="size-10 rounded-full bg-white text-black hover:bg-neutral-200 transition-colors duration-300"
            aria-label="Send message"
          >
            {isSending ? <Spinner className="size-4" /> : <ArrowUpIcon className="size-5" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-4 text-center text-[11px] font-medium tracking-wide text-white/30 uppercase">
        CruxGPT can make mistakes. Verify important info.
      </p>
    </form>
  );
}
