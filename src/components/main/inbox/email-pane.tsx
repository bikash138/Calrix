"use client";

import { useState } from "react";
import {
  Star,
  X,
  Archive,
  Trash2,
  Paperclip,
  MailOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFullDate, formatSize } from "@/lib/inbox-utils";
import { SenderAvatar } from "./sender-avatar";
import { EmailPaneSkeleton } from "./email-pane-skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  ThreadDetail,
  ThreadMessage,
  Attachment,
} from "@/lib/api-client/inbox.api";

export function EmailPane({
  detail,
  isLoading,
  onClose,
  onStar,
  onMarkUnread,
  onArchive,
  onDelete,
}: {
  detail: ThreadDetail | undefined;
  isLoading: boolean;
  onClose: () => void;
  onStar: (currentlyStarred: boolean) => void;
  onMarkUnread: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [prevDetailId, setPrevDetailId] = useState(detail?.id);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const lastId = detail?.messages[detail.messages.length - 1]?.id;
    return lastId ? new Set([lastId]) : new Set();
  });

  if (prevDetailId !== detail?.id) {
    setPrevDetailId(detail?.id);
    const lastId = detail?.messages[detail.messages.length - 1]?.id;
    setExpandedIds(lastId ? new Set([lastId]) : new Set());
  }

  const latest = detail?.messages[detail.messages.length - 1];
  const subject = detail?.messages[0]?.subject ?? "";
  const isStarred = latest?.starred ?? false;

  function toggleMessage(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onIframeLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    const iframe = e.currentTarget;
    if (!iframe?.contentDocument?.body) return;
    iframe.style.height = `${iframe.contentDocument.body.scrollHeight + 32}px`;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header */}
      <TooltipProvider delayDuration={400}>
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onStar(isStarred)}
                  className="group cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <Star
                    className={cn(
                      "h-4 w-4 transition-all duration-150 group-hover:scale-110",
                      isStarred
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground group-hover:text-amber-400",
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isStarred ? "Unstar" : "Star"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onMarkUnread}
                  className="group cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <MailOpen className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:scale-110 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Mark as unread</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onArchive}
                  className="group cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-accent"
                >
                  <Archive className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:scale-110 group-hover:text-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Archive</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="group cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:scale-110 group-hover:text-rose-500" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Delete</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onClose}
                className="group cursor-pointer rounded-lg p-2 transition-all duration-150 hover:bg-accent"
              >
                <X className="h-4 w-4 text-muted-foreground transition-all duration-150 group-hover:rotate-90 group-hover:text-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Close</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <EmailPaneSkeleton />
        ) : !latest ? (
          <p className="text-sm text-muted-foreground">Could not load email.</p>
        ) : (
          <>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {subject}
            </h2>

            <div className="flex flex-col gap-1">
              {detail!.messages.map((msg) => {
                const isExpanded = expandedIds.has(msg.id);
                return (
                  <MessageItem
                    key={msg.id}
                    msg={msg}
                    threadId={detail!.id}
                    isExpanded={isExpanded}
                    onToggle={() => toggleMessage(msg.id)}
                    onIframeLoad={onIframeLoad}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

function attachmentUrl(
  threadId: string,
  messageId: string,
  att: Attachment,
): string {
  return (
    `/api/inbox/${threadId}/attachment/${messageId}/${att.attachmentId}` +
    `?filename=${encodeURIComponent(att.filename)}&mimeType=${encodeURIComponent(att.mimeType)}`
  );
}

function MessageItem({
  msg,
  threadId,
  isExpanded,
  onToggle,
  onIframeLoad,
}: {
  msg: ThreadMessage;
  threadId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onIframeLoad: (e: React.SyntheticEvent<HTMLIFrameElement>) => void;
}) {
  const snippet = msg.textBody.replace(/\s+/g, " ").trim().slice(0, 80);

  return (
    <div
      className={cn(
        "rounded-xl border border-border transition-shadow duration-150",
        isExpanded ? "shadow-sm" : "hover:shadow-sm",
      )}
    >
      {/* Clickable header — always visible */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <SenderAvatar
          name={msg.senderName}
          className="h-8 w-8 shrink-0 text-xs"
        />

        {isExpanded ? (
          /* Expanded header: name + email stacked */
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground">
              {msg.senderName}
            </span>
            <span className="text-xs text-muted-foreground">
              {msg.senderEmail}
            </span>
          </div>
        ) : (
          /* Collapsed header: name + snippet inline */
          <div className="flex flex-1 items-baseline gap-2 min-w-0">
            <span className="shrink-0 text-sm font-semibold text-foreground">
              {msg.senderName}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {snippet}
            </span>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatFullDate(msg.date)}
          </span>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {msg.htmlBody ? (
            <iframe
              srcDoc={msg.htmlBody}
              sandbox="allow-same-origin"
              onLoad={onIframeLoad}
              title={`Message from ${msg.senderName}`}
              className="w-full border-0"
              style={{ minHeight: "200px" }}
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {msg.textBody}
            </div>
          )}

          {msg.attachments.length > 0 && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {msg.attachments.length} attachment
                {msg.attachments.length > 1 ? "s" : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {msg.attachments.map((att: Attachment) => (
                  <a
                    key={att.attachmentId}
                    href={attachmentUrl(threadId, msg.id, att)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs transition-colors hover:bg-accent hover:border-foreground/20"
                  >
                    <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="max-w-[160px] truncate text-foreground">
                      {att.filename}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatSize(att.size)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
window;
