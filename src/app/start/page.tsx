import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";


export default async function StartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  redirect("/dashboard");
}
