"use client";
import { useEffect, useRef, useState } from "react";

const APK_URL = "https://drive.qubdocs.online/share/yaIbv6nq1pms6XpHEcn78umkfbSyWmsatzZ1_Mng59U";
const APK_VERSION = "v1.0.0";

const PWA_DONE = "sl-install-banner";
const PWA_COUNT = "sl-install-dismissals";
const APK_DONE = "sl-apk-banner";
const APK_COUNT = "sl-apk-dismissals";
const MAX_DISMISSALS = 2;

interface PromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function readCount(key: string): number {
  try {
    return Number(localStorage.getItem(key) ?? 0);
  } catch {
    return MAX_DISMISSALS;
  }
}

function isDone(key: string): boolean {
  try {
    return localStorage.getItem(key) === "done";
  } catch {
    return true;
  }
}

/** One bottom dialog slot: window bar (title left, × right), PWA install
 *  first, APK download after. Each retires permanently after install or
 *  2 dismissals on the device; dismissals are logged per device. */
export function InstallBanner() {
  const [mode, setMode] = useState<"hidden" | "pwa" | "apk">(() =>
    !isDone(PWA_DONE) || isDone(APK_DONE) || readCount(APK_COUNT) >= MAX_DISMISSALS
      ? "hidden"
      : "apk",
  );
  const promptRef = useRef<PromptEvent | null>(null);

  useEffect(() => {
    if (isDone(PWA_DONE)) return;
    const t = window.setTimeout(() => {
      if (!isDone(APK_DONE) && readCount(APK_COUNT) < MAX_DISMISSALS) {
        setMode((m) => (m === "hidden" ? "apk" : m));
      }
    }, 4000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as PromptEvent;
      if (!isDone(PWA_DONE)) setMode("pwa");
    };
    const onInstalled = () => {
      try {
        localStorage.setItem(PWA_DONE, "done");
      } catch {
        /* ignore */
      }
      setMode((m) => (m === "pwa" ? "hidden" : m));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function logCancel(which: "pwa" | "apk") {
    try {
      const key = which === "pwa" ? PWA_COUNT : APK_COUNT;
      const doneKey = which === "pwa" ? PWA_DONE : APK_DONE;
      const n = readCount(key) + 1;
      localStorage.setItem(key, String(n));
      // Cancel log: per-device dismissal count for this dialog.
      console.info(`[app-banner] ${which} dismissed ${n}/${MAX_DISMISSALS}`);
      if (n >= MAX_DISMISSALS) localStorage.setItem(doneKey, "done");
    } catch {
      /* ignore */
    }
    setMode("hidden");
  }

  async function installPwa() {
    const prompt = promptRef.current;
    if (!prompt) {
      setMode("hidden");
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    try {
      if (outcome === "accepted") {
        localStorage.setItem(PWA_DONE, "done");
        setMode("hidden");
      } else {
        logCancel("pwa");
      }
    } catch {
      setMode("hidden");
    }
  }

  if (mode === "hidden") return null;
  const isPwa = mode === "pwa";

  return (
    <div
      role="dialog"
      aria-label={isPwa ? "Install StudioLog app" : "Download StudioLog for Android"}
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-amber-300 bg-white/95 shadow-xl backdrop-blur"
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-violet-800">
            {isPwa ? "Install app" : `Android app · ${APK_VERSION}`}
          </p>
          <button
            onClick={() => logCancel(isPwa ? "pwa" : "apk")}
            aria-label="Not now"
            className="shrink-0 rounded-full border-2 border-stone-300 px-2.5 py-0.5 text-sm font-extrabold text-stone-500"
          >
            ×
          </button>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-black text-white">
            S
          </span>
          <p className="min-w-0 flex-1 text-sm">
            <strong>{isPwa ? "Install StudioLog" : "Get StudioLog for Android"}</strong>
            <span className="block truncate text-stone-600">
              {isPwa
                ? "Faster access, offline page, home-screen icon."
                : "Signed APK, opens fullscreen. About 1 MB."}
            </span>
          </p>
          {isPwa ? (
            <button
              onClick={installPwa}
              className="shrink-0 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2 text-sm font-extrabold text-white shadow"
            >
              Install
            </button>
          ) : (
            <a
              href={APK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2 text-sm font-extrabold text-white shadow"
            >
              Download APK
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
