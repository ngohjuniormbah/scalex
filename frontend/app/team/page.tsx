import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const team = [
  { name: "Amara Okafor", role: "Managing Partner", focus: "AI, Fintech" },
  { name: "Daniel Chen", role: "Partner", focus: "Climate, Energy" },
  { name: "Sofia Marchetti", role: "Partner", focus: "Biotech, Deep tech" },
  { name: "Marcus Hale", role: "Principal", focus: "Developer tools" },
  { name: "Priya Raman", role: "Platform", focus: "Founder success" },
  { name: "Jonas Weber", role: "Operating Partner", focus: "GTM" },
];

export default function TeamPage() {
  return (
    <main>
      <Nav />
      <section className="bg-ink text-white pt-40 pb-20 bg-grid">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">
            Team
          </p>
          <h1 className="display text-5xl md:text-7xl">
            Operators turned <span className="text-brand">investors</span>.
          </h1>
        </div>
      </section>
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((m) => (
            <div
              key={m.name}
              className="rounded-xl border border-mute-200 bg-white p-8"
            >
              <div className="w-14 h-14 rounded-full bg-brand/10 mb-6" />
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="text-sm text-mute-500 mt-1">{m.role}</p>
              <p className="text-xs text-brand mt-3 font-mono uppercase tracking-wider">
                {m.focus}
              </p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
