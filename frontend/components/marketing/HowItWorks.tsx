"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Apply",
    body: "Submit your founder profile, traction, and vision. Eight focused steps — under 30 minutes.",
  },
  {
    n: "02",
    title: "Verify",
    body: "We run KYC, review traction, and confirm your story. Every founder on ScaleX is vetted.",
  },
  {
    n: "03",
    title: "Build",
    body: "Unlock the founder dashboard: co-founder matching, investor intros, and working capital tools.",
  },
  {
    n: "04",
    title: "Fund",
    body: "For the right teams, we move fast. Term sheet in days, not months, direct from ScaleX.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-paper">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.2em] uppercase text-mute-500 mb-4">
            How it works
          </p>
          <h2 className="display text-4xl md:text-6xl text-ink">
            From application to <span className="text-brand">wire transfer</span>.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative rounded-xl border border-mute-200 bg-white p-6 hover:border-brand/40 hover:shadow-lift transition-all"
            >
              <div className="text-xs font-mono text-brand mb-6">{s.n}</div>
              <h3 className="text-xl font-semibold text-ink mb-2">{s.title}</h3>
              <p className="text-sm text-mute-500 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
