"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { api, type FounderPublic } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";

const SECTORS = [
  ["", "All"],
  ["ai", "AI"],
  ["fintech", "Fintech"],
  ["climate", "Climate"],
  ["biotech", "Biotech"],
  ["deeptech", "Deep tech"],
  ["devtools", "Dev tools"],
  ["consumer", "Consumer"],
  ["enterprise", "Enterprise"],
];

export default function FoundersPage() {
  const { me, loading, logout } = useAuth();
  const [founders, setFounders] = useState<FounderPublic[]>([]);
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!me) return;
    const sp = new URLSearchParams(window.location.search);
    const initialQ = sp.get("q") || "";
    setQ(initialQ);
    runSearch(initialQ, "");
  }, [me]);

  async function runSearch(query: string, sec: string) {
    setSearching(true);
    try {
      const r = await api.directory(query, sec);
      setFounders(r);
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

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="display text-3xl mb-2">Founders</h1>
          <p className="text-mute-500">
            Browse verified founders on ScaleX. Connect, message, build.
          </p>
        </div>

        {/* Search bar */}
        <div className="rounded-xl border border-mute-200 bg-white p-4 mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(q, sector);
            }}
            className="flex flex-wrap gap-3"
          >
            <div className="flex-1 min-w-[220px] flex items-center bg-mute-100 rounded-lg px-3 h-11">
              <Search className="w-4 h-4 text-mute-500 mr-2" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, headline, location…"
                className="bg-transparent flex-1 outline-none text-sm"
              />
            </div>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                runSearch(q, e.target.value);
              }}
              className="rounded-lg border border-mute-200 bg-white px-3 h-11 text-sm"
            >
              {SECTORS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-brand hover:bg-brand-deep text-white text-sm font-medium px-5 h-11"
            >
              Search
            </button>
          </form>
        </div>

        {searching ? (
          <div className="text-mute-500 text-sm">Searching…</div>
        ) : founders.length === 0 ? (
          <div className="rounded-xl border border-mute-200 bg-white p-12 text-center">
            <p className="text-mute-500">
              No founders match your filters yet. Try a broader search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {founders.map((f) => (
              <Link
                key={f.id}
                href={`/founders/${f.id}`}
                className="rounded-xl border border-mute-200 bg-white overflow-hidden hover:border-brand transition-colors"
              >
                <div
                  className="h-20"
                  style={{
                    background: f.banner_url
                      ? `url(${f.banner_url}) center/cover`
                      : "linear-gradient(135deg, #0066FF 0%, #0A0A0A 100%)",
                  }}
                />
                <div className="p-4 -mt-8">
                  <div className="w-14 h-14 rounded-full ring-4 ring-white bg-mute-100 overflow-hidden flex items-center justify-center text-lg font-semibold text-mute-700 mb-3">
                    {f.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.photo_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      f.full_name?.[0] || "?"
                    )}
                  </div>
                  <div className="font-semibold text-ink truncate">
                    {f.full_name}
                  </div>
                  <div className="text-sm text-mute-500 truncate mt-0.5">
                    {f.headline || "—"}
                  </div>
                  {f.location && (
                    <div className="text-xs text-mute-500 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {f.location}
                    </div>
                  )}
                  {f.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {f.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-mute-100 text-mute-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
