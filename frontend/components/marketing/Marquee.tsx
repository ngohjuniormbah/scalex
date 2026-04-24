"use client";

const logos = [
  "Meridian",
  "Axon Labs",
  "Northwind",
  "Helio",
  "Foundry",
  "Tessera",
  "Kairos",
  "Veridian",
  "Parallax",
  "Quanta",
  "Arclight",
  "Orbital",
];

export function Marquee() {
  return (
    <section className="bg-paper border-y border-mute-200 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs tracking-[0.2em] uppercase text-mute-500 text-center mb-8">
          A sample of the companies we&apos;ve backed
        </p>
      </div>
      <div className="relative flex overflow-hidden whitespace-nowrap mask-gradient pb-12">
        <div className="flex animate-marquee">
          {[...logos, ...logos].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex-none px-12 text-2xl md:text-3xl font-semibold tracking-tightest text-mute-400"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .mask-gradient {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }
      `}</style>
    </section>
  );
}
