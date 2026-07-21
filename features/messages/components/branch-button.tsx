"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { branchConversation } from "@/features/conversation/actions/branch-conversation";
import { toast } from "sonner";

export function BranchButton({ messageId }: { messageId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBranch = () => {
    startTransition(async () => {
      try {
        const newId = await branchConversation(messageId);
        toast.success("Branched conversation");
        router.push(`/c/${newId}`);
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
