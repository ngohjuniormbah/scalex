"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/useAuth";
import { api, type Application } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";

const STATUS_FILTERS: Array<{ key: string; label: string }> = [
  { key: "", label: "All" },
  { key: "submitted", label: "Submitted" },
  { key: "under_review", label: "Under review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminPanelPage() {
  const router = useRouter();
  const { me, loading, logout } = useAuth();
  const [stats, setStats] = useState<{
    total: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
  } | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!me) return;
    if (!me.is_staff) {
      router.push("/dashboard");
      return;
    }
    api.adminStats().then(setStats);
    runSearch("", "");
  }, [me, router]);

  async function runSearch(s: string, query: string) {
    setSearching(true);
    try {
      const r = await api.adminList(s || undefined, query || undefined);
      setApps(r);
    } finally {
      setSearching(false);
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

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-brand mb-2">
              Admin · ScaleX
            </p>
            <h1 className="display text-3xl">Application review</h1>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Submitted" value={stats.submitted} accent="brand" />
            <StatCard
              label="Under review"
              value={stats.under_review}
              accent="amber"
            />
            <StatCard label="Approved" value={stats.approved} accent="emerald" />
            <StatCard label="Rejected" value={stats.rejected} />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-mute-200 bg-white p-4 mb-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(statusFilter, q);
            }}
            className="flex flex-wrap gap-2 items-center"
          >
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(f.key);
                    runSearch(f.key, q);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === f.key
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-mute-700 border-mute-200 hover:border-mute-400"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by email, name, or company…"
              className="ml-auto rounded-lg border border-mute-200 bg-white px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-brand"
            />
          </form>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-mute-200 bg-white overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 text-xs uppercase tracking-wider text-mute-500 border-b border-mute-200">
            <div className="col-span-3">Founder</div>
            <div className="col-span-3">Company</div>
            <div className="col-span-2">Stage / Sector</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Submitted</div>
          </div>

          {searching ? (
            <div className="px-4 py-12 text-center text-sm text-mute-500">
              Loading…
            </div>
          ) : apps.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-mute-500">
              No applications match these filters.
            </div>
          ) : (
            apps.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02 }}
              >
                <Link
                  href={`/admin-panel/${app.id}`}
                  className="grid grid-cols-12 px-4 py-3 items-center hover:bg-mute-50 border-b border-mute-100 transition-colors"
                >
                  <div className="col-span-3">
                    <div className="text-sm font-medium">
                      {app.user_full_name || "—"}
                    </div>
                    <div className="text-xs text-mute-500">{app.user_email}</div>
                  </div>
                  <div className="col-span-3 text-sm">
                    {app.company_name || "—"}
                  </div>
                  <div className="col-span-2 text-xs text-mute-500">
                    <div className="capitalize">{app.stage.replace("-", " ")}</div>
                    <div className="uppercase">{app.sector}</div>
                  </div>
                  <div className="col-span-2">
                    <StatusPill status={app.status} />
                  </div>
                  <div className="col-span-2 text-xs text-mute-500 text-right">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "brand" | "amber" | "emerald";
}) {
  const colors = {
    brand: "text-brand",
    amber: "text-amber-600",
    emerald: "text-emerald-600",
  };
  return (
    <div className="rounded-xl border border-mute-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-mute-500 mb-1">
        {label}
      </div>
      <div
        className={`text-2xl font-semibold tracking-tightest ${
          accent ? colors[accent] : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Application["status"] }) {
  const styles = {
    draft: "bg-mute-100 text-mute-700",
    submitted: "bg-brand-soft text-brand",
    under_review: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-mute-100 text-mute-500",
  };
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full ${styles[status]} capitalize`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
