export default function WishlistLoading() {
  return (
    <div
      className="animate-pulse space-y-6"
      aria-label="Loading wishlist…"
      aria-busy="true"
    >
      <div className="space-y-3 border-b border-brand-border/20 pb-6">
        <div className="h-3 w-24 rounded-full bg-brand-border/30" />
        <div className="h-7 w-48 rounded-lg bg-brand-border/30" />
        <div className="h-3.5 w-80 rounded-full bg-brand-border/20" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-brand-border/20 bg-brand-card p-5"
          >
            <div className="h-4 w-40 rounded-lg bg-brand-border/30" />
            <div className="mt-3 h-3 w-full rounded-full bg-brand-border/20" />
            <div className="mt-2 h-3 w-2/3 rounded-full bg-brand-border/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
