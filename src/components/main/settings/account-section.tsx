"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserStore } from "@/store/user.store";
import { accountApi } from "@/lib/api-client/account.api";
import { Row, Group } from "./settings-primitives";

export function AccountSection() {
  const user = useUserStore();
  const name = user.name;
  const email = user.email ?? "";

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const emailMatches = confirmEmail.trim().toLowerCase() === email.toLowerCase();

  const handleDelete = async () => {
    if (!emailMatches || isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await accountApi.deleteAccount();
      window.location.href = "/signin";
    } catch {
      setDeleteError("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmEmail("");
      setDeleteError("");
    }
    setDeleteOpen(open);
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <Dialog open={deleteOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-rose-500">Delete Account</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200/60 bg-rose-50/60 px-3 py-2.5 dark:border-rose-800/40 dark:bg-rose-950/30">
                  <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <p className="text-[0.72rem] leading-relaxed text-rose-700 dark:text-rose-300">
                    This will permanently delete your account, all emails, calendar data, AI history, and settings. <strong>This cannot be undone.</strong>
                  </p>
                </div>
                <p className="text-[0.75rem] text-muted-foreground">
                  Type <span className="font-medium text-foreground">{email}</span> to confirm.
                </p>
                <Input
                  value={confirmEmail}
                  onChange={(e) => { setConfirmEmail(e.target.value); setDeleteError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                  placeholder="Your email address"
                  className="bg-card text-[0.78rem] focus-visible:ring-rose-400/50"
                  autoComplete="off"
                  autoFocus
                />
                {deleteError && (
                  <p className="text-[0.68rem] text-rose-500">{deleteError}</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mx-0 mb-0 gap-3 border-0 bg-transparent p-0 sm:gap-3">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={!emailMatches || isDeleting}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              {isDeleting ? "Deleting…" : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Group title="Profile">
        <div className="flex items-center gap-4 py-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={name}
              width={40}
              height={40}
              className="shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Input
              value={name}
              readOnly
              className="bg-muted/40 text-[0.8rem] cursor-not-allowed select-none"
            />
            <p className="mt-1 text-[0.68rem] text-muted-foreground">{email}</p>
          </div>
        </div>
      </Group>

      <Group title="Connected Accounts">
        <Row
          label="Gmail"
          description="Read and send emails via your Google account"
        >
          <span className="flex items-center gap-1 text-[0.68rem] text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </span>
        </Row>
        <Row
          label="Google Calendar"
          description="Sync your calendar events and meetings"
          last
        >
          <span className="flex items-center gap-1 text-[0.68rem] text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Connected
          </span>
        </Row>
      </Group>

      <Group title="Danger Zone">
        <Row
          label="Delete Account"
          description="Permanently delete your account and all data"
          last
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="border-rose-500/30 text-rose-400 hover:border-rose-500/60 hover:bg-rose-500/5 hover:text-rose-400 text-[0.7rem]"
          >
            Delete Account
          </Button>
        </Row>
      </Group>
    </div>
  );
}
