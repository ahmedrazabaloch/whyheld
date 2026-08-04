type Props = {
  destination: string;
  placeNames: string[];
  embedUrl: string | null;
};

/**
 * Calm route overview: Maps embed (when key available) + ordered place list.
 */
export function JourneyRouteMap({ destination, placeNames, embedUrl }: Props) {
  const uniquePlaces = Array.from(
    new Set(placeNames.map((n) => n.trim()).filter(Boolean)),
  );

  return (
    <section aria-labelledby="route-map-heading" className="space-y-6">
      <header>
        <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary/80">
          Route
        </p>
        <h2
          id="route-map-heading"
          className="font-display text-2xl text-brand-text-primary sm:text-3xl"
        >
          Route at a glance
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-text-secondary">
          A quiet look at {destination}
          {uniquePlaces.length > 0
            ? ` and the places woven through your days.`
            : `.`}
        </p>
      </header>

      {embedUrl ? (
        <div className="overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-card">
          <iframe
            title={`Map of ${destination}`}
            src={embedUrl}
            className="h-[280px] w-full border-0 sm:h-[340px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-brand-border/70 bg-brand-bg/60 px-6 py-10 text-center"
          aria-label={`Map placeholder for ${destination}`}
        >
          <p className="max-w-sm text-sm leading-relaxed text-brand-text-secondary">
            A map of {destination} will appear here when Maps is configured.
          </p>
        </div>
      )}

      {uniquePlaces.length > 0 ? (
        <ol className="space-y-2">
          {uniquePlaces.map((name, index) => (
            <li
              key={name}
              className="flex items-baseline gap-3 text-sm text-brand-text-primary"
            >
              <span className="w-6 shrink-0 text-xs tabular-nums text-brand-text-secondary/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">{name}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

/** Build a Google Maps Embed search URL when an API key is present. */
export function buildMapsEmbedUrl(query: string): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || !query.trim()) return null;
  const q = encodeURIComponent(query.trim());
  return `https://www.google.com/maps/embed/v1/search?key=${key}&q=${q}`;
}
