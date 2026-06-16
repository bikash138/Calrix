import Link from "next/link";
import Image from "next/image";

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
