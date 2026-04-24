"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Me = { id: number; email: string; full_name: string };
type App = { id: number; status: string; current_step: number };

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("scalex_token")
        : null;
    if (!token) {
      router.push("/login");
      return;
    }

    (async () => {
      try {
        const [u, a] = await Promise.all([api.me(), api.myApplication()]);
        setMe(u);
        setApp(a);
      } catch {
        localStorage.removeItem("scalex_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("scalex_token");
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      {/* Top bar */}
      <header className="border-b border-mute-200">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tightest">
            scale<span className="text-brand">x</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-mute-500">{me?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-mute-500 hover:text-ink"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-mute-500 mb-3">
          Founder dashboard
        </p>
        <h1 className="display text-4xl md:text-5xl text-ink">
          Welcome, {me?.full_name?.split(" ")[0] ?? "founder"}.
        </h1>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Application status">
            {app ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-brand" />
                  <span className="text-sm font-medium text-ink capitalize">
                    {app.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-mute-500">
                  We&apos;ll email you as soon as a partner has reviewed.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-mute-500 mb-4">
                  No application submitted yet.
                </p>
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-deep"
                >
                  Start application →
                </Link>
              </>
            )}
          </Card>

          <Card title="Profile">
            <p className="text-sm text-mute-500 mb-4">
              Keep your founder profile sharp. Investors see this first.
            </p>
            <button className="text-sm text-brand hover:text-brand-deep">
              Edit profile →
            </button>
          </Card>

          <Card title="Messages">
            <p className="text-sm text-mute-500 mb-4">
              No new messages. Co-founder matching opens once your application
              is approved.
            </p>
          </Card>
        </div>

        <div className="mt-10 rounded-xl border border-mute-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-ink mb-2">
            What happens next
          </h2>
          <ol className="text-sm text-mute-500 space-y-2 mt-4">
            <li>
              <span className="font-mono text-brand mr-2">01</span>
              A partner reviews your application within 14 days.
            </li>
            <li>
              <span className="font-mono text-brand mr-2">02</span>
              If there&apos;s a fit, we schedule a 30-minute deep dive.
            </li>
            <li>
              <span className="font-mono text-brand mr-2">03</span>
              Term sheet or a kind pass — we always reply.
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-mute-200 bg-white p-6">
      <div className="text-xs uppercase tracking-[0.15em] text-mute-500 mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}
