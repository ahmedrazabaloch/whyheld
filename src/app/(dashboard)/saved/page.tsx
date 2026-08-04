import { redirect } from "next/navigation";

/** Legacy Saved route — renamed to Wishlist. */
export default function SavedRedirectPage() {
  redirect("/wishlist");
}
