"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";

type CommandEntry = {
  id: string;
  label: string;
  group: "navigation" | "commands";
  icon: React.ElementType;
  danger?: boolean;
  action: () => void;
};

type Props = {
  navResults: CommandEntry[];
  cmdResults: CommandEntry[];
  maximized?: boolean;
};

export function SearchTab({ navResults, cmdResults, maximized }: Props) {
  return (
    <CommandList className={cn(maximized ? "h-full" : "h-[280px]", "p-2")}>
      <CommandEmpty className="py-8 text-center text-sm text-zinc-400">
        No results found.
      </CommandEmpty>

      {navResults.length > 0 && (
        <CommandGroup heading="Navigation">
          {navResults.map(({ id, label, icon: Icon, action }) => (
            <CommandItem
              key={id}
              value={id}
              onSelect={action}
              className="gap-3 rounded-md px-2.5 py-1.5 text-zinc-700 data-selected:bg-zinc-100 data-selected:text-zinc-900 dark:text-zinc-200 dark:data-selected:bg-white/8 dark:data-selected:text-white"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm">{label}</span>
              <CommandShortcut>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {cmdResults.length > 0 && (
        <CommandGroup heading="Commands">
          {cmdResults.map(({ id, label, icon: Icon, action, danger }) => (
            <CommandItem
              key={id}
              value={id}
              onSelect={action}
              className={cn(
                "gap-3 rounded-md px-2.5 py-1.5 data-selected:bg-zinc-100 dark:data-selected:bg-white/8",
                danger
                  ? "text-rose-500 data-selected:text-rose-500"
                  : "text-zinc-700 data-selected:text-zinc-900 dark:text-zinc-200 dark:data-selected:text-white",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  danger
                    ? "bg-rose-50 text-rose-400 dark:bg-rose-950/30"
                    : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm">{label}</span>
              <CommandShortcut>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600" />
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </CommandList>
  );
}
