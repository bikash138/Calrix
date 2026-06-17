import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo() {
  return (
    <Link
      href="#top"
      className="transition-opacity duration-300 ease-out hover:opacity-80"
    >
      <Image
        src="/icon.svg"
        alt="Calrix"
        width={28}
        height={28}
        className="rounded-sm"
      />
    </Link>
  );
}

/** Bare Calrix mark (no link) — use as an avatar/icon. */
export function LogoMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/icon.svg"
      alt="Calrix"
      width={size}
      height={size}
      className={cn("rounded-md", className)}
    />
  );
}
