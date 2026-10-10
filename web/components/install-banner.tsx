"use client";
import { useEffect, useRef, useState } from "react";

const DONE_KEY = "sl-install-banner";
const COUNT_KEY = "sl-install-dismissals";
const MAX_DISMISSALS = 2;

interface PromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Dismiss (×) goes right; after install or 2 dismissals it never shows again. */
export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const promptRef = useRef<PromptEvent | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(DONE_KEY) === "done") return;
    } catch {
      return;
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as PromptEvent;
      setVisible(true);
    };
    const onInstalled = () => {
      try {
        localStorage.setItem(DONE_KEY, "done");
      } catch {
        /* ignore */
      }
      setVisible(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function recordDismissal() {
    try {
      const n = Number(localStorage.getItem(COUNT_KEY) ?? 0) + 1;
      // Cancel log: how many times this device dismissed the banner.
      localStorage.setItem(COUNT_KEY, String(n));
      // eslint-disable-next-line no-console
      console.info(`[install-banner] dismissed ${n}/${MAX_DISMISSALS}`);
      if (n >= MAX_DISMISSALS) localStorage.setItem(DONE_KEY, "done");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  async function install() {
    const prompt = promptRef.current;
    if (!prompt) {
      setVisible(false);
      return;
    }
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    try {
      if (outcome === "accepted") {
        localStorage.setItem(DONE_KEY, "done");
      } else {
        recordDismissal();
        return;
      }
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install StudioLog app"
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-amber-300 bg-white/95 shadow-xl backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-lg font-black text-white">
          S
        </span>
        <p className="min-w-0 flex-1 text-sm">
          <strong>Install StudioLog</strong>
          <span className="block truncate text-stone-600">
            Faster access, offline page, home-screen icon.
          </span>
        </p>
        <button
          onClick={install}
          className="shrink-0 rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-2 text-sm font-extrabold text-white shadow"
        >
          Install
        </button>
        <button
          onClick={recordDismissal}
          aria-label="Not now"
          className="shrink-0 rounded-full border-2 border-stone-300 px-2.5 py-1 text-sm font-extrabold text-stone-500"
        >
          ×
        </button>
      </div>
    </div>
  );
}
