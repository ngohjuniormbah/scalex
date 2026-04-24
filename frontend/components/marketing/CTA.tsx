"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-ink text-white px-10 py-20 md:px-20 md:py-28 text-center"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 50%, rgba(0,102,255,0.35) 0%, rgba(0,102,255,0) 70%)",
            }}
          />
          <div className="relative">
            <h2 className="display text-4xl md:text-6xl max-w-3xl mx-auto">
              Building something that matters?
            </h2>
            <p className="mt-6 text-white/60 text-lg max-w-xl mx-auto">
              Applications take under 30 minutes. We respond to every founder
              within 14 days.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white font-medium px-6 py-3 shadow-lift"
              >
                Apply for funding <span aria-hidden>→</span>
              </Link>
              <Link
                href="/team"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors text-white font-medium px-6 py-3"
              >
                Meet the team
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
