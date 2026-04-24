"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen bg-ink text-white overflow-hidden bg-grid">
      {/* Soft blue radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, rgba(0,102,255,0.18) 0%, rgba(0,102,255,0) 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-48 pb-32 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs tracking-[0.2em] text-white/60 uppercase mb-8"
        >
          Venture Capital for Builders
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="display text-5xl md:text-7xl lg:text-8xl max-w-5xl mx-auto"
        >
          We fund the founders
          <br />
          <span className="text-white/70">shaping tomorrow.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl mx-auto"
        >
          ScaleX backs rigorously vetted founders building category-defining
          companies in AI, fintech, climate, and deep tech.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white font-medium px-6 py-3 shadow-lift"
          >
            Apply for funding <span aria-hidden>→</span>
          </Link>
          <Link
            href="/thesis"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors text-white font-medium px-6 py-3"
          >
            Read our thesis <span aria-hidden>→</span>
          </Link>
        </motion.div>

        {/* Floating orb — inspired by the Scale AI hero sphere */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mt-20 mx-auto w-64 h-64 md:w-80 md:h-80 relative animate-float"
        >
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-70"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #4d94ff 0%, #0066ff 40%, #0a0a0a 80%)",
            }}
          />
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(77,148,255,0.6) 30%, #0066ff 70%)",
              boxShadow: "inset -20px -20px 60px rgba(0,0,0,0.4)",
            }}
          />
        </motion.div>
      </div>

      {/* Caption row below hero */}
      <div className="relative z-10 pb-10 text-center text-xs text-white/40 tracking-widest uppercase">
        Trusted by founders across 4 continents
      </div>
    </section>
  );
}
