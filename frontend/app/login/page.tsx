"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const auth = await api.login({ email, password });
      localStorage.setItem("scalex_token", auth.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-semibold tracking-tightest mb-10"
        >
          scale<span className="text-brand">x</span>
        </Link>

        <div className="rounded-xl border border-mute-200 bg-white p-8 shadow-subtle">
          <h1 className="display text-2xl mb-2">Welcome back</h1>
          <p className="text-sm text-mute-500 mb-6">
            Sign in to your founder account.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium mb-2">Email</span>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-mute-200 bg-white px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-sm font-medium mb-2">Password</span>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-mute-200 bg-white px-4 py-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white font-medium px-6 py-3 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <p className="mt-6 text-sm text-mute-500 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/apply" className="text-brand hover:underline">
              Apply
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
