import Image from "next/image";
import Link from "next/link";
import meImg from "@/assets/landing/me.webp";
import { XIcon } from "@/assets/x-icon";
import { LinkedInIcon } from "@/assets/linkedin-icon";

export default function FooterSection() {
  return (
    <footer id="footer" className="bg-black text-white rounded-t-3xl">
      <div className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-3">
            <Image
              src={meImg}
              alt="Bikash Shaw"
              width={128}
              height={128}
              className="h-32 w-32 rounded-full object-cover ring-1 ring-white/20"
            />
            <div className="flex flex-col items-center gap-0.5">
              <span className="font-mono text-xs tracking-tighter text-white/40">
                Developed by
              </span>
              <Link
                href="https://www.bikashshaw.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-sm font-bold tracking-tight text-white transition-colors duration-300 ease-out hover:text-white/80"
              >
                Bikash Shaw
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="https://x.com/Bikash__Shaw"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="grid h-8 w-8 place-items-center rounded-full text-white ring-1 ring-white/15 transition-all duration-300 ease-out hover:bg-white/10 active:scale-95"
              >
                <XIcon className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/bikash-shaw-5ab74727b/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid h-8 w-8 place-items-center rounded-full ring-1 ring-white/15 transition-all duration-300 ease-out hover:bg-white/10 active:scale-95"
                style={{ color: "#0A66C2" }}
              >
                <LinkedInIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <Image
              src="/icon.svg"
              alt="Calrix"
              width={40}
              height={40}
              className="mb-7 rounded-sm"
            />
            <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight md:text-5xl">
              Your Email &amp; Calendar,
              <br />
              <span className="text-white/45">on Autopilot</span>
              <span className="text-accent">.</span>
            </h2>
            <div className="mt-8 flex flex-row items-center justify-between gap-6 border-t border-white/10 pt-6">
              <p className="text-sm text-white/45">
                © {new Date().getFullYear()} Calrix, Inc.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  href="#pricing"
                  className="text-sm text-white/55 transition-colors duration-300 ease-out hover:text-white"
                >
                  Pricing
                </Link>
                <Link
                  href="#security"
                  className="text-sm text-white/55 transition-colors duration-300 ease-out hover:text-white"
                >
                  Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
