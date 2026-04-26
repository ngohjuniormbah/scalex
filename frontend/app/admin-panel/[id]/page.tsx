"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Check, X, Clock } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { api, type Application } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";

export default function AdminAppDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const appId = parseInt(params.id, 10);
  const { me, loading, logout } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    if (!me.is_staff) {
      router.push("/dashboard");
      return;
    }
    api
      .adminDetail(appId)
      .then((a) => {
        setApp(a);
        setNotes(a.decision_notes || "");
      })
      .catch(() => setApp(null));
  }, [me, appId, router]);

  async function decide(decision: "approve" | "reject" | "review") {
    setWorking(true);
    setError(null);
    try {
      const updated = await api.adminDecide(appId, decision, notes);
      setApp(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setWorking(false);
    }
  }

  if (loading || !me) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }
  if (!me.is_staff) return null;
  if (!app) {
    return (
      <main className="min-h-screen bg-mute-50">
        <DashboardNav me={me} onLogout={logout} />
        <div className="mx-auto max-w-4xl px-6 py-16 text-center text-mute-500">
          Application not found.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-4xl px-4 md:px-6 py-8">
        <Link
          href="/admin-panel"
          className="inline-flex items-center gap-1 text-sm text-mute-500 hover:text-ink mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back to queue
        </Link>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="display text-3xl mb-1">
              {app.user_full_name || "—"}
            </h1>
            <p className="text-mute-500">{app.user_email}</p>
          </div>
          <span
            className={`text-sm px-3 py-1.5 rounded-full capitalize ${
              app.status === "approved"
                ? "bg-emerald-100 text-emerald-700"
                : app.status === "rejected"
                  ? "bg-mute-100 text-mute-500"
                  : app.status === "under_review"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-brand-soft text-brand"
            }`}
          >
            {app.status.replace("_", " ")}
          </span>
        </div>

        <div className="rounded-xl border border-mute-200 bg-white p-6 mb-4">
          <h2 className="font-semibold mb-4">Company</h2>
          <Pair label="Name" value={app.company_name} />
          <Pair label="One-liner" value={app.one_liner} />
          <Pair label="Stage" value={app.stage} />
          <Pair label="Sector" value={app.sector} />
          <Pair label="Website" value={app.website} link />
          <Pair label="Pitch deck" value={app.pitch_deck_url} link />
          <Pair label="Incorporated in" value={app.incorporated_in} />
          <Pair
            label="Team"
            value={`${app.cofounders_count} co-founder(s), ${app.fulltime_count} full-time`}
          />
        </div>

        <div className="rounded-xl border border-mute-200 bg-white p-6 mb-4">
          <h2 className="font-semibold mb-4">Founder</h2>
          <Pair label="Bio" value={app.bio} block />
          <Pair label="LinkedIn" value={app.linkedin} link />
          <Pair label="Location" value={app.location} />
        </div>

        <div className="rounded-xl border border-mute-200 bg-white p-6 mb-4">
          <h2 className="font-semibold mb-4">Traction</h2>
          <Pair label="Revenue" value={app.revenue} />
          <Pair label="Users" value={app.users} />
          <Pair label="Growth rate" value={app.growth_rate} />
          <Pair label="Previous funding" value={app.previous_funding} />
          <Pair label="References" value={app.references} block />
        </div>

        <div className="rounded-xl border border-mute-200 bg-white p-6 mb-6">
          <h2 className="font-semibold mb-4">Vision</h2>
          <Pair label="Vision (10y)" value={app.vision} block />
          <Pair label="Why this market is ready" value={app.market} block />
          <Pair label="Why this team" value={app.team} block />
          <Pair label="Why now" value={app.why_now} block />
        </div>

        {/* Decision panel */}
        <div className="rounded-xl border border-mute-200 bg-white p-6 sticky bottom-4 shadow-lift">
          <h2 className="font-semibold mb-3">Decision</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for the founder (visible on their dashboard)…"
            className="w-full rounded-lg border border-mute-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand min-h-[100px] mb-3"
          />
          {error && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => decide("approve")}
              disabled={working}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
            >
              <Check className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => decide("review")}
              disabled={working}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
            >
              <Clock className="w-4 h-4" /> Move to review
            </button>
            <button
              onClick={() => decide("reject")}
              disabled={working}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mute-700 hover:bg-ink text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
            >
              <X className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Pair({
  label,
  value,
  block,
  link,
}: {
  label: string;
  value: string | null;
  block?: boolean;
  link?: boolean;
}) {
  if (!value) {
    return (
      <div className="py-2 grid grid-cols-3 gap-3 text-sm border-b border-mute-100 last:border-0">
        <div className="text-mute-500">{label}</div>
        <div className="col-span-2 text-mute-400 italic">—</div>
      </div>
    );
  }
  return (
    <div className="py-2 grid grid-cols-3 gap-3 text-sm border-b border-mute-100 last:border-0">
      <div className="text-mute-500">{label}</div>
      <div className="col-span-2 text-ink">
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline break-all"
          >
            {value}
          </a>
        ) : block ? (
          <div className="whitespace-pre-wrap">{value}</div>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
