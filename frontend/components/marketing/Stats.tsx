"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: 1.6, ease: "easeOut" });
      return () => controls.stop();
    }
  }, [inView, to, count]);

  return (
    <span ref={ref} className="font-mono">
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  { value: 2.4, prefix: "$", suffix: "B", decimals: 1, label: "Capital deployed" },
  { value: 340, suffix: "+", decimals: 0, label: "Portfolio companies" },
  { value: 28, suffix: "", decimals: 0, label: "Exits & IPOs" },
  { value: 12, suffix: "", decimals: 0, label: "Year vintage" },
];

export function Stats() {
  return (
    <section className="bg-paper border-y border-mute-200">
      <div className="mx-auto max-w-7xl px-6 py-20 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-left"
          >
            <div className="text-4xl md:text-5xl font-semibold tracking-tightest text-ink">
              <Counter
                to={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals}
              />
            </div>
            <div className="mt-3 text-sm text-mute-500">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
