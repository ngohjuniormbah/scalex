"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Users, FileText } from "lucide-react";
import { apiFetch, type FounderPublic, type PostDTO } from "@/lib/api";

type SearchResults = {
  query: string;
  founders: FounderPublic[];
  posts: PostDTO[];
};

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await apiFetch<SearchResults>(
          `/api/search/?q=${encodeURIComponent(q)}`
        );
        setResults(r);
      } catch {
        setResults({ query: q, founders: [], posts: [] });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Esc to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function clearSearch() {
    setQuery("");
    setResults(null);
    inputRef.current?.focus();
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function pickFounder(id: number) {
    setOpen(false);
    setQuery("");
    router.push(`/founders/${id}`);
  }

  const hasResults = !!(
    results &&
    (results.founders.length > 0 || results.posts.length > 0)
  );
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative hidden md:block w-72">
      <form onSubmit={submitSearch}>
        <div className="flex items-center bg-mute-100 rounded-md px-3 h-9 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-soft">
          <Search className="w-4 h-4 text-mute-500 mr-2 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search founders, sectors…"
            className="bg-transparent text-sm flex-1 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-mute-400 hover:text-mute-700 ml-1 shrink-0"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-11 left-0 right-0 bg-white border border-mute-200 rounded-lg shadow-lift max-h-[28rem] overflow-y-auto z-50">
          {loading && !results && (
            <div className="px-4 py-6 text-sm text-mute-500 text-center">
              Searching…
            </div>
          )}

          {!loading && !hasResults && results && (
            <div className="px-4 py-6 text-sm text-mute-500 text-center">
              No results for &quot;{results.query}&quot;
            </div>
          )}

          {hasResults && results && (
            <div className="py-2">
              {results.founders.length > 0 && (
                <div>
                  <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-mute-500 flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    Founders
                  </div>
                  {results.founders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => pickFounder(f.id)}
                      className="w-full flex items-start gap-3 px-4 py-2 hover:bg-mute-50 text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-mute-100 flex items-center justify-center text-xs font-semibold text-mute-700 shrink-0 overflow-hidden">
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
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ink truncate">
                          {f.full_name}
                        </div>
                        <div className="text-xs text-mute-500 truncate">
                          {f.headline || f.location || "Founder"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.posts.length > 0 && (
                <div className={results.founders.length > 0 ? "border-t border-mute-100 mt-1 pt-1" : ""}>
                  <div className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-mute-500 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    Posts
                  </div>
                  {results.posts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/founders/${p.author_id}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="block px-4 py-2 hover:bg-mute-50"
                    >
                      <div className="text-xs text-mute-500 mb-0.5">
                        {p.author_name}
                      </div>
                      <div className="text-sm text-ink line-clamp-2">
                        {p.body}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-mute-100 mt-1">
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full text-center text-xs text-brand hover:bg-mute-50 py-2.5 font-medium"
                >
                  View all results for &quot;{query.trim()}&quot; →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
