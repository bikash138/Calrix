import { DroppingBallLoader } from "@/components/ui/dropping-ball-loader";

/**
 * Unauthenticated preview for the dropping-ball loader.
 * Visit /loader to see it at a few sizes on light and dark backgrounds.
 */
export default function LoaderPreviewPage() {
  return (
    <main className="min-h-screen w-full bg-background px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">
            Dropping Ball Loader
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Squash-and-stretch loader built from the Calrix mark
          </p>
        </div>

        {/* Hero — large, with label */}
        <div className="flex w-full items-center justify-center rounded-2xl border border-border bg-card py-16">
          <DroppingBallLoader size={64} label="Loading your workspace…" />
        </div>

        {/* Size variants */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          {[28, 44, 72].map((s) => (
            <div
              key={s}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-10"
            >
              <DroppingBallLoader size={s} />
              <span className="text-xs text-muted-foreground">size={s}</span>
            </div>
          ))}
        </div>

        {/* On a dark surface */}
        <div className="flex w-full items-center justify-center rounded-2xl bg-zinc-950 py-16">
          <DroppingBallLoader size={56} label="Please wait…" />
        </div>
      </div>
    </main>
  );
}
