import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Stats } from "@/components/marketing/Stats";
import { Marquee } from "@/components/marketing/Marquee";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Thesis } from "@/components/marketing/Thesis";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Stats />
      <Marquee />
      <HowItWorks />
      <Thesis />
      <CTA />
      <Footer />
    </main>
  );
}
