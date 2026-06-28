"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userFactsApi, type UserFact } from "@/lib/api-client/user-facts.api";
import { FACT_CATEGORY_LABEL, FACT_CATEGORY_ORDER } from "@/server/db/schema/user-facts";
import { Card } from "./settings-primitives";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE = 3;

export function MemorySection() {
  const qc = useQueryClient();
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["user-facts"],
    queryFn: () => userFactsApi.list(),
    staleTime: 1000 * 60,
  });

  const { mutate: remove, isPending } = useMutation({
    mutationFn: (id: string) => userFactsApi.remove(id),
    onSuccess: (_, id) => {
      qc.setQueryData(
        ["user-facts"],
        (old: Awaited<ReturnType<typeof userFactsApi.list>> | undefined) => {
          if (!old) return old;
          return { ...old, data: old.data.filter((f) => !f.id.startsWith(id)) };
        },
      );
      toast.success("Fact removed");
    },
    onError: () => toast.error("Failed to remove fact"),
  });

  const facts = data?.data ?? [];
  const visibleFacts = showAll ? facts : facts.slice(0, INITIAL_VISIBLE);
  const hiddenCount = facts.length - INITIAL_VISIBLE;
  const hasAny = facts.length > 0;

  const byCategory = FACT_CATEGORY_ORDER.reduce<Record<string, UserFact[]>>(
    (acc, cat) => {
      acc[cat] = visibleFacts.filter((f) => f.category === cat);
      return acc;
    },
    {} as Record<string, UserFact[]>,
  );

  return (
    <div>
      {isLoading && (
        <p className="text-[0.75rem] text-muted-foreground">Loading…</p>
      )}

      {!isLoading && !hasAny && (
        <Card>
          <div className="py-6 text-center">
            <p className="text-[0.8rem] font-medium text-foreground">
              No saved facts yet
            </p>
            <p className="mt-1 text-[0.72rem] text-muted-foreground">
              Calrix will remember things you tell it during chat — like your
              preferences, people you work with, and how you like to work.
            </p>
          </div>
        </Card>
      )}

      {!isLoading && hasAny && (
        <Card>
          {FACT_CATEGORY_ORDER.map((cat) => {
            const items = byCategory[cat];
            if (!items.length) return null;
            return (
              <div key={cat}>
                <p className="pt-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  {FACT_CATEGORY_LABEL[cat]}
                </p>
                {items.map((fact, i) => {
                  const isLastInCategory = i === items.length - 1;
                  return (
                    <div
                      key={fact.id}
                      className={cn(
                        "flex items-start justify-between gap-4 py-2.5",
                        !isLastInCategory && "border-b border-border/40",
                      )}
                    >
                      <p className="text-[0.8rem] text-foreground leading-snug">
                        {fact.content}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() => remove(fact.id.slice(0, 8))}
                        className="h-6 shrink-0 px-2 text-[0.7rem] text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {hiddenCount > 0 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full py-2.5 text-[0.72rem] text-muted-foreground hover:text-foreground transition-colors text-left border-t border-border/40 mt-1"
            >
              {showAll ? "Show less" : `Show ${hiddenCount} more…`}
            </button>
          )}
        </Card>
      )}

      {!isLoading && hasAny && (
        <p className="mt-2 text-[0.7rem] text-muted-foreground">
          {facts.length} / 20 facts saved.
        </p>
      )}
    </div>
  );
}
