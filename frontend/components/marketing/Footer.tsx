import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="text-2xl font-semibold tracking-tightest">
            scale<span className="text-brand">x</span>
          </Link>
          <p className="mt-4 text-sm text-white/50 max-w-xs">
            Venture capital for the founders building what&apos;s next.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
            Firm
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/thesis" className="text-white/70 hover:text-white">Thesis</Link></li>
            <li><Link href="/team" className="text-white/70 hover:text-white">Team</Link></li>
            <li><Link href="/portfolio" className="text-white/70 hover:text-white">Portfolio</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
            Resources
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link href="/insights" className="text-white/70 hover:text-white">Insights</Link></li>
            <li><Link href="/apply" className="text-white/70 hover:text-white">Apply</Link></li>
            <li><Link href="/login" className="text-white/70 hover:text-white">Log in</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
            Contact
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            <li>hello@scalex.vc</li>
            <li>San Francisco · New York</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-white/40">
          <span>© {new Date().getFullYear()} ScaleX Capital. All rights reserved.</span>
          <span className="font-mono">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
