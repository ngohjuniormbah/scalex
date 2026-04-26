"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Users, Inbox, LayoutGrid, LogOut, Shield } from "lucide-react";
import { type Me } from "@/lib/api";

export function DashboardNav({ me, onLogout }: { me: Me | null; onLogout: () => void }) {
  const pathname = usePathname();
  const isActive = (p: string) =>
    pathname === p || (p !== "/dashboard" && pathname.startsWith(p));

  const items = [
    { href: "/dashboard", label: "Home", icon: LayoutGrid },
    { href: "/founders", label: "Founders", icon: Users },
    { href: "/connections", label: "Network", icon: Inbox },
    { href: "/messages", label: "Messages", icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-mute-200">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center gap-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tightest shrink-0">
          scale<span className="text-brand">x</span>
        </Link>

        <div className="hidden md:flex items-center bg-mute-100 rounded-md px-3 h-9 w-72">
          <Search className="w-4 h-4 text-mute-500 mr-2" />
          <input
            placeholder="Search founders, sectors…"
            className="bg-transparent text-sm flex-1 outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) window.location.href = `/founders?q=${encodeURIComponent(v)}`;
              }
            }}
          />
        </div>

        <nav className="flex items-center gap-1 md:gap-2 ml-auto">
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
                <span className="hidden sm:block">{it.label}</span>
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
              <span className="hidden sm:block">Admin</span>
            </Link>
          )}

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center px-3 h-14 text-xs text-mute-500 hover:text-ink"
            title="Log out"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            <span className="hidden sm:block">Log out</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
