export default function ComposeLoading() {
  return (
    <div
      className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center animate-pulse"
      aria-busy="true"
      aria-label="Opening journey preparation"
    >
      <div className="mb-6 h-3 w-36 rounded bg-brand-border/50" />
      <div className="h-10 w-72 max-w-full rounded bg-brand-border/40 sm:h-12" />
      <div className="mt-6 h-4 w-full max-w-md rounded bg-brand-border/35" />
      <div className="mt-2 h-4 w-4/5 max-w-sm rounded bg-brand-border/30" />
    </div>
  );
}
