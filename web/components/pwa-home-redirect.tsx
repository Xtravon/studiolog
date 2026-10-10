"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function launchedAsApp(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** Installed PWA skips the marketing landing and opens the working app. */
export function PwaHomeRedirect() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!launchedAsApp() || isPending) return;
    router.replace(session ? "/shipments" : "/services");
  }, [router, session, isPending]);

  return null;
}
