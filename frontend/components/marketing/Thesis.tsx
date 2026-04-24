"use client";

import { motion } from "framer-motion";

const thesis = [
  { tag: "AI", title: "Applied AI", body: "Agents, infrastructure, and vertical models reshaping work." },
  { tag: "Fintech", title: "Financial rails", body: "Payments, capital markets, and embedded finance." },
  { tag: "Climate", title: "Climate & energy", body: "Grid, storage, and industrial decarbonization." },
  { tag: "Biotech", title: "Life sciences", body: "Therapeutics, diagnostics, and biomanufacturing." },
  { tag: "Deep", title: "Deep tech", body: "Robotics, space, and frontier hardware." },
  { tag: "Dev", title: "Developer tools", body: "Infrastructure for the next million builders." },
];

export function Thesis() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">
            Where we invest
          </p>
          <h2 className="display text-4xl md:text-6xl">
            Six sectors. <span className="text-white/50">One conviction.</span>
          </h2>
          <p className="mt-6 text-white/60 text-lg">
            We back technical founders solving non-obvious problems in markets
            that will matter in ten years.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {thesis.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative rounded-xl border border-white/10 bg-white/[0.02] p-8 hover:border-brand/60 hover:bg-white/[0.04] transition-all"
            >
              <div className="inline-block px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 text-white/70 mb-6">
                {t.tag}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{t.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{t.body}</p>
              <div className="mt-8 text-brand text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more →
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
