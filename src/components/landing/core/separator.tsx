export default function Separator() {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span className="h-20 w-px bg-border" />
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
    </div>
  );
}
