import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "@/lib/inbox-utils";

export function SenderAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <div className={cn(
      "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
      getAvatarColor(name),
      className,
    )}>
      {getInitials(name)}
    </div>
  );
}
