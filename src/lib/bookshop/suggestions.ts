/**
 * Bookshop.org suggestion links for Raven's US storefront.
 * Affiliate id is optional — without it, links still open Bookshop search.
 */

export type BookSuggestion = {
  kind: "fiction" | "nonfiction";
  label: string;
  blurb: string;
  href: string;
};

function affiliateBase(): string {
  const id = process.env.NEXT_PUBLIC_BOOKSHOP_AFFILIATE_ID?.trim();
  return id ? `https://bookshop.org/a/${encodeURIComponent(id)}` : "https://bookshop.org";
}

function searchHref(keywords: string): string {
  const q = encodeURIComponent(keywords.trim());
  return `${affiliateBase()}/search?keywords=${q}`;
}

/** Destination-aware fiction + non-fiction search links. */
export function buildBookSuggestions(destination: string): BookSuggestion[] {
  const place = destination.trim() || "travel";
  return [
    {
      kind: "fiction",
      label: "Fiction",
      blurb: `Stories set in or inspired by ${place}.`,
      href: searchHref(`${place} fiction novel`),
    },
    {
      kind: "nonfiction",
      label: "Non-fiction",
      blurb: `Travel writing, history, and place studies for ${place}.`,
      href: searchHref(`${place} travel history nonfiction`),
    },
  ];
}
