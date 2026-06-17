"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { InboxFilterTabs } from "./inbox-filter-tabs";
import { InboxSearchBar } from "./inbox/inbox-search-bar";
import { CalendarViewSwitcher } from "./calendar-view-switcher";
import { useActionsCount } from "./actions-count-provider";

function ActionsPendingBadge() {
  const { pendingCount } = useActionsCount();
  if (pendingCount === 0) return null;
  return (
    <div className="flex items-center gap-1.5 pl-1">
      <span className="rounded-full bg-muted px-2 py-px text-[0.65rem] font-semibold text-muted-foreground">
        {pendingCount}
      </span>
      <span className="text-[0.68rem] text-muted-foreground">pending actions</span>
    </div>
  );
}

function CalrixLogo() {
  return (
    <Link href="/chat" className="flex items-center gap-1.5 pl-1">
      <Image src="/icon.svg" alt="Calrix" width={20} height={20} className="rounded-sm" />
      <span className="text-sm font-semibold tracking-tight text-foreground">
        Calrix
      </span>
    </Link>
  );
}

export function TopBarExtrasLeft() {
  const pathname = usePathname();

  if (pathname === "/inbox") {
    return (
      <Suspense>
        <InboxSearchBar />
      </Suspense>
    );
  }

  return <CalrixLogo />;
}

export function TopBarExtrasRight() {
  const pathname = usePathname();

  if (pathname === "/inbox") {
    return (
      <Suspense>
        <InboxFilterTabs />
      </Suspense>
    );
  }

  if (pathname === "/calender") {
    return (
      <Suspense>
        <CalendarViewSwitcher />
      </Suspense>
    );
  }

  if (pathname === "/actions") {
    return <ActionsPendingBadge />;
  }

  return null;
}
