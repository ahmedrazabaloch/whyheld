import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { getCachedSession } from "@/lib/auth/session-cache";
import { loadWishlistItems } from "@/actions/place-actions";

export const metadata: Metadata = {
  title: "Wishlist — Wayheld",
  description:
    "Places that felt meaningful — saved from Discovery and your journeys.",
};

export default async function WishlistPage() {
  const session = await getCachedSession();

  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const items = await loadWishlistItems();

  return (
    <>
      <PageHeader
        eyebrow="Wishlist"
        title="Wishlist"
        description="Places that felt meaningful — waiting for the right journey."
      />

      <WishlistView items={items} />
    </>
  );
}
