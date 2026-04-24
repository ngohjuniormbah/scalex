import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

const companies = [
  { name: "Meridian", sector: "AI infra", year: "2023" },
  { name: "Axon Labs", sector: "Fintech", year: "2022" },
  { name: "Northwind", sector: "Climate", year: "2024" },
  { name: "Helio", sector: "Energy", year: "2021" },
  { name: "Foundry", sector: "Dev tools", year: "2023" },
  { name: "Tessera", sector: "Biotech", year: "2022" },
  { name: "Kairos", sector: "AI", year: "2024" },
  { name: "Veridian", sector: "Climate", year: "2023" },
  { name: "Parallax", sector: "Deep tech", year: "2024" },
];

export default function PortfolioPage() {
  return (
    <main>
      <Nav />
      <section className="bg-ink text-white pt-40 pb-20 bg-grid">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">
            Portfolio
          </p>
          <h1 className="display text-5xl md:text-7xl">
            <span className="text-brand">340+</span> companies.
            <br />
            <span className="text-white/70">One mission.</span>
          </h1>
        </div>
      </section>
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {companies.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-mute-200 bg-white p-8 hover:border-brand/40 hover:shadow-lift transition-all"
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-mono text-mute-500">
                  {c.year}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-soft text-brand">
                  {c.sector}
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tightest">
                {c.name}
              </h3>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
