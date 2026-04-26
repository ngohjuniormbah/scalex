"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, FileText } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { apiFetch, type FounderPublic, type PostDTO } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";
import { PostCard } from "@/components/dashboard/PostCard";

type SearchResults = {
  query: string;
  founders: FounderPublic[];
  posts: PostDTO[];
};

function SearchPageInner() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();
  const { me, loading: authLoading, logout } = useAuth();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!me || !q) return;
    setLoading(true);
    apiFetch<SearchResults>(`/api/search/?q=${encodeURIComponent(q)}&limit=20`)
      .then(setResults)
      .catch(() => setResults({ query: q, founders: [], posts: [] }))
      .finally(() => setLoading(false));
  }, [me, q]);

  if (authLoading || !me) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8">
        <h1 className="text-2xl font-semibold text-ink mb-1">
          {q ? <>Results for &quot;{q}&quot;</> : "Search"}
        </h1>
        {results && (
          <p className="text-sm text-mute-500 mb-6">
            {results.founders.length + results.posts.length}{" "}
            {results.founders.length + results.posts.length === 1
              ? "result"
              : "results"}
          </p>
        )}

        {!q && (
          <p className="text-sm text-mute-500">
            Use the search bar to find founders or posts.
          </p>
        )}

        {loading && q && (
          <p className="text-sm text-mute-500">Searching…</p>
        )}

        {results && results.founders.length === 0 && results.posts.length === 0 && (
          <div className="rounded-xl border border-mute-200 bg-white p-8 text-center text-sm text-mute-500">
            No results for &quot;{q}&quot;. Try a different search.
          </div>
        )}

        {results && results.founders.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-mute-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Founders ({results.founders.length})
            </h2>
            <div className="space-y-3">
              {results.founders.map((f) => (
                <Link
                  key={f.id}
                  href={`/founders/${f.id}`}
                  className="flex items-start gap-4 rounded-xl border border-mute-200 bg-white p-4 hover:border-brand transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 shrink-0 overflow-hidden">
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
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink truncate">
                      {f.full_name}
                    </div>
                    {f.headline && (
                      <div className="text-sm text-mute-700 truncate">
                        {f.headline}
                      </div>
                    )}
                    {f.location && (
                      <div className="text-xs text-mute-500 mt-0.5">
                        {f.location}
                      </div>
                    )}
                    {f.skills && f.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {f.skills.slice(0, 5).map((s) => (
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
          </section>
        )}

        {results && results.posts.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-mute-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts ({results.posts.length})
            </h2>
            <div className="space-y-4">
              {results.posts.map((p) => (
                <PostCard key={p.id} post={p} currentUserId={me.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-mute-50 flex items-center justify-center">
          <div className="text-mute-500 text-sm">Loading…</div>
        </main>
      }
    >
      <SearchPageInner />
    </Suspense>
  );
}
