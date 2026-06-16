import Link from "next/link";
import Image from "next/image";

export function LogoWithText() {
  return (
    <Link
      href="#top"
      className="flex items-center gap-2 transition-opacity duration-300 ease-out hover:opacity-80"
    >
      <Image src="/icon.svg" alt="Calrix" width={28} height={28} className="rounded-sm" />
      <span className="font-sans text-xl font-bold tracking-tight">Calrix</span>
    </Link>
  );
}
