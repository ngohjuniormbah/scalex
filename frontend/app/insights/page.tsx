import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const essays = [
  {
    date: "Mar 2026",
    title: "The next decade of applied AI",
    body: "Why the most valuable AI companies won't be the ones with the best models.",
  },
  {
    date: "Feb 2026",
    title: "How we run due diligence",
    body: "A look inside our 14-day process — from first call to wire.",
  },
  {
    date: "Jan 2026",
    title: "Climate is the next enterprise software",
    body: "The patterns we're seeing in the energy transition.",
  },
];

export default function InsightsPage() {
  return (
    <main>
      <Nav />
      <section className="bg-ink text-white pt-40 pb-20 bg-grid">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">
            Insights
          </p>
          <h1 className="display text-5xl md:text-7xl">
            Essays, notes,
            <br />
            <span className="text-brand">public memos</span>.
          </h1>
        </div>
      </section>
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-3xl px-6 space-y-4">
          {essays.map((e) => (
            <article
              key={e.title}
              className="rounded-xl border border-mute-200 bg-white p-8 hover:border-brand/40 hover:shadow-lift transition-all cursor-pointer"
            >
              <div className="text-xs font-mono text-mute-500 mb-3">
                {e.date}
              </div>
              <h3 className="text-2xl font-semibold tracking-tightest mb-3">
                {e.title}
              </h3>
              <p className="text-mute-500">{e.body}</p>
              <div className="mt-6 text-sm text-brand">Read essay →</div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
