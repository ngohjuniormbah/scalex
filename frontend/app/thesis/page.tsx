import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";

export default function ThesisPage() {
  return (
    <main>
      <Nav />
      <section className="bg-ink text-white pt-40 pb-24 bg-grid">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-4">
            Our thesis
          </p>
          <h1 className="display text-5xl md:text-7xl">
            We invest in <span className="text-brand">inevitability</span>.
          </h1>
          <p className="mt-8 text-lg text-white/70 max-w-2xl">
            The next decade will be defined by a small number of founders who
            see around corners. We exist to find them early and stay with them
            for the long arc.
          </p>
        </div>
      </section>
      <section className="bg-paper py-24">
        <div className="mx-auto max-w-3xl px-6 space-y-8 text-mute-700 leading-relaxed">
          <p>
            ScaleX is a generalist fund with a preference for technical
            founders, hard problems, and markets the consensus has written off.
            We write first checks from $250k to $4M.
          </p>
          <p>
            We concentrate. A typical vintage holds 18–22 companies. Every
            founder we back gets the full weight of the firm — introductions,
            recruiting, follow-on capital, and operating playbooks built from
            the successes and scars of the last 400 companies in our portfolio.
          </p>
          <p>
            We move fast. If we&apos;re the right partner, you&apos;ll know
            within two weeks. If we&apos;re not, you&apos;ll know why.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
