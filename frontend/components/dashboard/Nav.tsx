"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Users,
  Inbox,
  LayoutGrid,
  LogOut,
  Shield,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { type Me } from "@/lib/api";
import { SearchBar } from "@/components/dashboard/SearchBar";

export function DashboardNav({ me, onLogout }: { me: Me | null; onLogout: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const isActive = (p: string) =>
    pathname === p || (p !== "/dashboard" && pathname.startsWith(p));

  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutGrid },
    { href: "/founders", label: "Founders", icon: Users },
    { href: "/connections", label: "Network", icon: Inbox },
    { href: "/messages", label: "Messages", icon: Bell },
  ];

  function submitMobileSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = mobileQuery.trim();
    if (!q) return;
    setMobileSearchOpen(false);
    setMobileQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-mute-200">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 h-14 flex items-center gap-2 sm:gap-6">
          <Link
            href="/dashboard"
            className="text-base sm:text-lg font-semibold tracking-tightest shrink-0"
          >
            scale<span className="text-brand">x</span>
          </Link>

          <SearchBar />

          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden ml-auto p-2 -mr-1 text-mute-500 hover:text-ink"
            aria-label="Search"
          >
            <SearchIcon className="w-5 h-5" />
          </button>

          <nav className="hidden md:flex items-center gap-1 md:gap-2 ml-auto">
            {items.map((it) => {
              const Icon = it.icon;
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`flex flex-col items-center justify-center px-3 h-14 text-xs transition-colors border-b-2 ${
                    active
                      ? "text-ink border-brand"
                      : "text-mute-500 hover:text-ink border-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span>{it.label}</span>
                </Link>
              );
            })}

            {me?.is_staff && (
              <Link
                href="/admin-panel"
                className={`flex flex-col items-center justify-center px-3 h-14 text-xs transition-colors border-b-2 ${
                  isActive("/admin-panel")
                    ? "text-brand border-brand"
                    : "text-mute-500 hover:text-brand border-transparent"
                }`}
              >
                <Shield className="w-5 h-5 mb-0.5" />
                <span>Admin</span>
              </Link>
            )}

            <button
              onClick={onLogout}
              className="flex flex-col items-center justify-center px-3 h-14 text-xs text-mute-500 hover:text-ink"
              title="Log out"
            >
              <LogOut className="w-5 h-5 mb-0.5" />
              <span>Log out</span>
            </button>
          </nav>
        </div>

        {mobileSearchOpen && (
          <div className="md:hidden absolute inset-x-0 top-0 bg-white border-b border-mute-200 z-50 px-3 h-14 flex items-center gap-2">
            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setMobileQuery("");
              }}
              className="p-2 -ml-1 text-mute-500"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={submitMobileSearch} className="flex-1">
              <input
                autoFocus
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="Search founders, sectors…"
                className="w-full bg-mute-100 rounded-md px-3 h-9 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-soft"
              />
            </form>
          </div>
        )}
      </header>

      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-mute-200 grid h-14 ${
          me?.is_staff ? "grid-cols-6" : "grid-cols-5"
        }`}
      >
        {items.map((it) => {
          const Icon = it.icon;
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-col items-center justify-center text-[10px] transition-colors ${
                active ? "text-brand" : "text-mute-500"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate px-0.5">{it.label}</span>
            </Link>
          );
        })}
        {me?.is_staff && (
          <Link
            href="/admin-panel"
            className={`flex flex-col items-center justify-center text-[10px] transition-colors ${
              isActive("/admin-panel") ? "text-brand" : "text-mute-500"
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </Link>
        )}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center text-[10px] text-mute-500"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span>Log out</span>
        </button>
      </nav>

      <div className="md:hidden h-14" aria-hidden />
    </>
  );
}
