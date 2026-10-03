"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/sign-in");
      }}
      className="rounded-xl border-2 border-violet-600 bg-white px-4 py-2.5 text-sm font-extrabold text-violet-950"
    >
      Sign out
    </button>
  );
}
