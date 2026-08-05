export default function ComposeLoading() {
  return (
    <div
      className="mx-auto flex min-h-[78vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center animate-pulse"
      aria-busy="true"
      aria-label="Opening journey preparation"
    >
      <div className="mb-5 h-3 w-44 rounded bg-brand-border/50" />
      <div className="h-10 w-full max-w-lg rounded bg-brand-border/40 sm:h-12" />
      <div className="mt-5 h-4 w-full max-w-md rounded bg-brand-border/35" />
      <div className="mt-2 h-4 w-4/5 max-w-sm rounded bg-brand-border/30" />
      <div className="mt-10 flex flex-wrap justify-center gap-2.5">
        <div className="h-9 w-28 rounded-full bg-brand-border/35" />
        <div className="h-9 w-24 rounded-full bg-brand-border/35" />
        <div className="h-9 w-32 rounded-full bg-brand-border/35" />
      </div>
      <div className="mt-12 h-20 w-full max-w-xl rounded-2xl bg-brand-border/25" />
    </div>
  );
}
