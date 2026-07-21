import type { HTMLAttributes } from "react";
import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

export type LoaderProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export const Loader = ({ className, size = 16, ...props }: LoaderProps) => (
  <div
    className={cn("flex items-center justify-center gap-1.5 h-6", className)}
    {...props}
  >
    <div className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="w-1.5 h-1.5 bg-foreground/60 rounded-full animate-bounce" />
  </div>
);
