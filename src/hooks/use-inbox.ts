"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  inboxApi,
  type InboxFilter,
  type InboxAction,
  type InboxListPage,
  type ThreadDetail,
  type ThreadRow,
} from "@/lib/api-client/inbox.api";
import { groupThreads } from "@/lib/inbox-utils";

//Navigation

export function useInboxNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get("threadId");
  const filter = (searchParams.get("filter") ?? "all") as InboxFilter;

  function navigateToThread(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("threadId", id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function closePane() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("threadId");
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function setFilter(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", id);
    params.delete("threadId");
    router.push(`/inbox?${params.toString()}`);
  }

  return { selectedId, filter, navigateToThread, closePane, setFilter };
}

//Thread list with infinite scroll

export function useInboxList(filter: InboxFilter) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["inbox", filter],
      queryFn: ({ pageParam }) =>
        inboxApi.listThreads({ filter, pageToken: pageParam }),
      getNextPageParam: (lastPage) => lastPage.nextPageToken ?? undefined,
      initialPageParam: undefined as string | undefined,
      staleTime: 60_000,
    });

  const allThreads = data?.pages.flatMap((p) => p.threads) ?? [];
  const groups = groupThreads(allThreads);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { allThreads, groups, isPending, isFetchingNextPage, sentinelRef };
}

//Thread detail

export function useInboxThread(selectedId: string | null): {
  threadDetail: ThreadDetail | undefined;
  isLoadingDetail: boolean;
} {
  const { data: threadDetail, isPending: isLoadingDetail } = useQuery({
    queryKey: ["inbox", "thread", selectedId],
    queryFn: () => inboxApi.getThread(selectedId!),
    enabled: !!selectedId,
    staleTime: 30_000,
  });

  return { threadDetail, isLoadingDetail };
}

//Mutations (patch + delete) with optimistic updates

export function useInboxActions(
  filter: InboxFilter,
  onDeleteSuccess: () => void,
) {
  const queryClient = useQueryClient();

  const { mutate: patchThread } = useMutation({
    mutationFn: ({
      threadId,
      action,
    }: {
      threadId: string;
      action: InboxAction;
    }) => inboxApi.patchThread(threadId, action),
    onMutate: async ({ threadId, action }) => {
      await queryClient.cancelQueries({ queryKey: ["inbox", filter] });
      await queryClient.cancelQueries({
        queryKey: ["inbox", "thread", threadId],
      });

      const prevList = queryClient.getQueryData<InfiniteData<InboxListPage>>([
        "inbox",
        filter,
      ]);
      const prevDetail = queryClient.getQueryData<ThreadDetail>([
        "inbox",
        "thread",
        threadId,
      ]);

      if (action === "star" || action === "unstar") {
        const starred = action === "star";
        queryClient.setQueryData<InfiniteData<InboxListPage>>(
          ["inbox", filter],
          (old) =>
            old
              ? {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    threads: page.threads.map((t) =>
                      t.id === threadId ? { ...t, starred } : t,
                    ),
                  })),
                }
              : old,
        );
        queryClient.setQueryData<ThreadDetail>(
          ["inbox", "thread", threadId],
          (old) =>
            old
              ? {
                  ...old,
                  messages: old.messages.map((m) => ({ ...m, starred })),
                }
              : old,
        );
      }

      if (action === "markRead" || action === "markUnread") {
        const unread = action === "markUnread";
        queryClient.setQueryData<InfiniteData<InboxListPage>>(
          ["inbox", filter],
          (old) =>
            old
              ? {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    threads: page.threads.map((t) =>
                      t.id === threadId ? { ...t, unread } : t,
                    ),
                  })),
                }
              : old,
        );
      }

      return { prevList, prevDetail };
    },
    onError: (_err, { threadId }, ctx) => {
      if (ctx?.prevList)
        queryClient.setQueryData(["inbox", filter], ctx.prevList);
      if (ctx?.prevDetail)
        queryClient.setQueryData(["inbox", "thread", threadId], ctx.prevDetail);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["inbox", filter] }),
  });

  const { mutate: deleteThread } = useMutation({
    mutationFn: (threadId: string) => inboxApi.deleteThread(threadId),
    onSuccess: () => {
      onDeleteSuccess();
      queryClient.invalidateQueries({ queryKey: ["inbox", filter] });
    },
  });

  return { patchThread, deleteThread };
}

// Keyboard shortcuts

export function useInboxKeyboard({
  allThreads,
  selectedId,
  navigateToThread,
  closePane,
  setFilter,
  patchThread,
  deleteThread,
}: {
  allThreads: ThreadRow[];
  selectedId: string | null;
  navigateToThread: (id: string) => void;
  closePane: () => void;
  setFilter: (id: string) => void;
  patchThread: (args: { threadId: string; action: InboxAction }) => void;
  deleteThread: (threadId: string) => void;
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.shiftKey && e.key.toLowerCase() === "r") {
        window.dispatchEvent(new CustomEvent("calrix:refresh"));
        return;
      }

      const idx = selectedId
        ? allThreads.findIndex((t) => t.id === selectedId)
        : -1;

      switch (e.key) {
        case "j":
        case "ArrowDown": {
          e.preventDefault();
          if (!allThreads.length) break;
          const next =
            idx === -1 ? 0 : Math.min(idx + 1, allThreads.length - 1);
          navigateToThread(allThreads[next].id);
          break;
        }
        case "k":
        case "ArrowUp": {
          e.preventDefault();
          if (!allThreads.length) break;
          const prev = Math.max(idx <= 0 ? 0 : idx - 1, 0);
          navigateToThread(allThreads[prev].id);
          break;
        }
        case "Escape":
          e.preventDefault();
          closePane();
          break;
        case "e":
          if (selectedId) {
            patchThread({ threadId: selectedId, action: "archive" });
            closePane();
          }
          break;
        case "#":
          if (selectedId) deleteThread(selectedId);
          break;
        case "s": {
          if (selectedId) {
            const thread = allThreads.find((t) => t.id === selectedId);
            if (thread)
              patchThread({
                threadId: selectedId,
                action: thread.starred ? "unstar" : "star",
              });
          }
          break;
        }
        case "u":
          if (selectedId) {
            patchThread({ threadId: selectedId, action: "markUnread" });
            closePane();
          }
          break;
        case "1":
          setFilter("all");
          break;
        case "2":
          setFilter("unread");
          break;
        case "3":
          setFilter("starred");
          break;
        case "4":
          setFilter("sent");
          break;
        case "5":
          setFilter("trash");
          break;
        case "/":
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("calrix:focus-search"));
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts((v) => !v);
          break;
      }
    }

    function onShowShortcutsEvent() {
      setShowShortcuts((v) => !v);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener(
      "calrix:show-shortcuts",
      onShowShortcutsEvent as EventListener,
    );
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(
        "calrix:show-shortcuts",
        onShowShortcutsEvent as EventListener,
      );
    };
  });

  return { showShortcuts, setShowShortcuts };
}
