"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const links = [
  { href: "/thesis", label: "Thesis" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/team", label: "Team" },
  { href: "/insights", label: "Insights" },
];

export function Nav() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(
      typeof window !== "undefined" && !!localStorage.getItem("scalex_token")
    );
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="absolute top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-white text-xl tracking-tightest font-semibold"
        >
          scale<span className="text-brand">x</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white text-sm font-medium px-4 py-2"
            >
              Dashboard <span aria-hidden>→</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white text-sm font-medium px-4 py-2"
              >
                Apply <span aria-hidden>→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
