"use client";

import { useTransition } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { branchConversation } from "@/features/conversation/actions/branch-conversation";
import { toast } from "sonner";

export function BranchButton({ messageId }: { messageId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleBranch = () => {
    startTransition(async () => {
      try {
        await branchConversation(messageId);
        toast.success("Branched conversation");
      } catch {
        toast.error("Failed to branch conversation");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleBranch}
      disabled={isPending}
      title="Branch conversation from this message"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <GitBranch className="h-3 w-3" />}
    </Button>
  );
}
