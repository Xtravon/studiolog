"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message ?? "Sign in failed");
      return;
    }
    router.push("/me");
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Sign in to StudioLog
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Seeded general admin: <code>admin@studiolog.local</code>
      </p>
      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <label className="grid gap-1 text-sm font-semibold">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2.5 font-normal outline-none focus:border-violet-600"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-gradient-to-b from-orange-500 to-orange-600 px-4 py-3 font-extrabold text-white shadow disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-600">
        No account?{" "}
        <Link href="/sign-up" className="font-bold text-violet-800 underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
