"use client";

import { Suspense } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useInboxList,
  useInboxActions,
  useInboxThread,
  useInboxNavigation,
  useInboxKeyboard,
} from "@/hooks/use-inbox";
import { ThreadRow } from "@/components/main/inbox/thread-row";
import { EmailPane } from "@/components/main/inbox/email-pane";
import { ShortcutsModal } from "@/components/main/inbox/shortcuts-modal";

export default function InboxPage() {
  return (
    <Suspense>
      <InboxContent />
    </Suspense>
  );
}

function InboxContent() {
  const { selectedId, filter, navigateToThread, closePane, setFilter } =
    useInboxNavigation();
  const { patchThread, deleteThread } = useInboxActions(filter, closePane);
  const { allThreads, groups, isPending, isFetchingNextPage, sentinelRef } =
    useInboxList(filter);
  const { threadDetail, isLoadingDetail } = useInboxThread(selectedId);
  const { showShortcuts, setShowShortcuts } = useInboxKeyboard({
    allThreads,
    selectedId,
    navigateToThread,
    closePane,
    setFilter,
    patchThread,
    deleteThread,
  });

  function selectThread(id: string) {
    navigateToThread(id);
    patchThread({ threadId: id, action: "markRead" });
  }

  function toggleStar(
    threadId: string,
    currentlyStarred: boolean,
    ev?: React.MouseEvent,
  ) {
    ev?.stopPropagation();
    patchThread({ threadId, action: currentlyStarred ? "unstar" : "star" });
  }

  return (
    <>
      <ShortcutsModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {/* Thread list */}
          <div
            className={cn(
              "flex min-h-0 flex-col overflow-y-auto transition-all",
              selectedId
                ? "flex-1 md:w-[38%] md:flex-none md:shrink-0 md:border-r md:border-border"
                : "flex-1",
            )}
          >
            {isPending ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No emails here</p>
              </div>
            ) : (
              <>
                {groups.map((group) => (
                  <section key={group.label}>
                    <div className="px-4 pb-1 pt-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {group.label}
                      </span>
                    </div>
                    {group.threads.map((t) => (
                      <ThreadRow
                        key={t.id}
                        thread={t}
                        selected={selectedId === t.id}
                        compact={!!selectedId}
                        onSelect={() => selectThread(t.id)}
                        onStar={(ev) => toggleStar(t.id, t.starred, ev)}
                      />
                    ))}
                  </section>
                ))}
                <div ref={sentinelRef} className="py-1" />
                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Reading pane — full-screen sheet sliding up from the bottom on
              mobile, side-by-side split on md+ */}
          {selectedId && (
            <div className="fixed inset-0 z-60 flex flex-col overflow-hidden bg-background animate-in slide-in-from-bottom duration-300 md:relative md:inset-auto md:z-auto md:min-h-0 md:min-w-0 md:flex-1 md:animate-none">
              <EmailPane
                detail={threadDetail}
                isLoading={isLoadingDetail}
                onClose={closePane}
                onStar={(starred) => toggleStar(selectedId, starred)}
                onMarkUnread={() => {
                  patchThread({ threadId: selectedId, action: "markUnread" });
                  closePane();
                }}
                onArchive={() =>
                  patchThread({ threadId: selectedId, action: "archive" })
                }
                onDelete={() => deleteThread(selectedId)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-2.5 border-b border-border px-5 py-3">
      <div className="h-7 w-7 shrink-0 rounded-full bg-muted" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-20 rounded bg-muted" />
          <div className="h-2 w-10 rounded bg-muted" />
        </div>
        <div className="h-2.5 w-full rounded bg-muted" />
      </div>
    </div>
  );
}
