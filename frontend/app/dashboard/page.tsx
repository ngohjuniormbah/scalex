"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Edit3, Clock } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import {
  api,
  type FounderSelf,
  type FounderPublic,
  type Application,
  type ConnectionDTO,
} from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";
import { ProfileCard } from "@/components/dashboard/ProfileCard";

export default function DashboardPage() {
  const { me, loading, logout } = useAuth();
  const [profile, setProfile] = useState<FounderSelf | null>(null);
  const [app, setApp] = useState<Application | null>(null);
  const [suggested, setSuggested] = useState<FounderPublic[]>([]);
  const [connections, setConnections] = useState<ConnectionDTO[]>([]);

  useEffect(() => {
    if (!me) return;
    api.myProfile().then(setProfile).catch(() => {});
    api.myApplication().then(setApp).catch(() => {});
    api.directory().then((r) => setSuggested(r.slice(0, 4))).catch(() => {});
    api
      .myConnections()
      .then((r) => setConnections(r.accepted))
      .catch(() => {});
  }, [me]);

  if (loading || !me) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  const profilePublic: FounderPublic | null = profile
    ? {
        id: me.id,
        full_name: me.full_name,
        is_verified: me.is_verified,
        headline: profile.headline,
        bio: profile.bio,
        location: profile.location,
        photo_url: profile.photo_url,
        banner_url: profile.banner_url,
        linkedin: profile.linkedin,
        github: profile.github,
        twitter: profile.twitter,
        website: profile.website,
        skills: profile.skills,
        sectors_of_interest: profile.sectors_of_interest,
        looking_for: profile.looking_for,
      }
    : null;

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: profile card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-8 space-y-6"
          >
            {profilePublic && (
              <ProfileCard
                founder={profilePublic}
                selfView
                rightSlot={
                  <Link
                    href="/dashboard/profile/edit"
                    className="inline-flex items-center gap-1.5 text-sm border border-mute-200 hover:border-brand text-ink rounded-lg px-3 py-1.5 bg-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Link>
                }
              />
            )}

            {/* Application status card */}
            <div className="rounded-xl border border-mute-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Application status</h2>
                {!app && (
                  <Link
                    href="/apply"
                    className="text-sm text-brand hover:text-brand-deep"
                  >
                    Start application →
                  </Link>
                )}
              </div>
              {app ? (
                <ApplicationStatusBlock app={app} />
              ) : (
                <p className="text-sm text-mute-500">
                  You haven&apos;t submitted an application yet. Until you do,
                  your profile is visible in the directory but not eligible for
                  funding review.
                </p>
              )}
            </div>

            {/* Recent connections */}
            <div className="rounded-xl border border-mute-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your network</h2>
                <Link
                  href="/connections"
                  className="text-sm text-brand hover:text-brand-deep"
                >
                  See all
                </Link>
              </div>
              {connections.length === 0 ? (
                <p className="text-sm text-mute-500">
                  No connections yet. Browse the founder directory to start.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {connections.slice(0, 6).map((c) => {
                    const other =
                      c.requester.id === me.id ? c.recipient : c.requester;
                    return (
                      <Link
                        href={`/founders/${other.id}`}
                        key={c.id}
                        className="rounded-lg border border-mute-200 p-3 hover:border-brand transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 mb-2 overflow-hidden">
                          {other.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={other.photo_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            other.full_name?.[0] || "?"
                          )}
                        </div>
                        <div className="text-sm font-medium truncate">
                          {other.full_name}
                        </div>
                        <div className="text-xs text-mute-500 truncate">
                          {other.headline || other.email}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: suggested founders */}
          <motion.aside
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="rounded-xl border border-mute-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Founders to meet</h3>
                <Link
                  href="/founders"
                  className="text-xs text-brand hover:text-brand-deep"
                >
                  Browse all
                </Link>
              </div>
              {suggested.length === 0 ? (
                <p className="text-sm text-mute-500">
                  No founders to show yet. Check back as the platform grows.
                </p>
              ) : (
                <div className="space-y-4">
                  {suggested.map((f) => (
                    <SuggestedFounderRow key={f.id} f={f} />
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-mute-200 bg-white p-6">
              <h3 className="font-semibold mb-3">What happens next</h3>
              <ol className="text-sm text-mute-500 space-y-2">
                <li>
                  <span className="font-mono text-brand mr-2">01</span>
                  A partner reviews within 14 days
                </li>
                <li>
                  <span className="font-mono text-brand mr-2">02</span>
                  Build out your profile + connect with peers
                </li>
                <li>
                  <span className="font-mono text-brand mr-2">03</span>
                  Term sheet or honest pass — we always reply
                </li>
              </ol>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}

function ApplicationStatusBlock({ app }: { app: Application }) {
  const labels: Record<Application["status"], { text: string; color: string; icon: React.ElementType }> = {
    draft: { text: "Draft", color: "text-mute-500", icon: Clock },
    submitted: { text: "Submitted", color: "text-brand", icon: Clock },
    under_review: { text: "Under review", color: "text-amber-600", icon: Clock },
    approved: { text: "Approved", color: "text-emerald-600", icon: CheckCircle2 },
    rejected: { text: "Not advanced", color: "text-mute-500", icon: Clock },
  };
  const cfg = labels[app.status];
  const Icon = cfg.icon;
  return (
    <div>
      <div className={`flex items-center gap-2 ${cfg.color} mb-3`}>
        <Icon className="w-4 h-4" />
        <span className="font-medium">{cfg.text}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-mute-500 mb-0.5">
            Company
          </div>
          <div>{app.company_name || "—"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-mute-500 mb-0.5">
            Stage
          </div>
          <div className="capitalize">{app.stage.replace("-", " ")}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-mute-500 mb-0.5">
            Sector
          </div>
          <div className="uppercase">{app.sector}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-mute-500 mb-0.5">
            Submitted
          </div>
          <div>{new Date(app.submitted_at).toLocaleDateString()}</div>
        </div>
      </div>
      {app.decision_notes && (
        <div className="mt-4 rounded-lg bg-mute-50 border border-mute-200 p-3 text-sm text-mute-700">
          <div className="text-xs uppercase tracking-wider text-mute-500 mb-1">
            Notes from reviewer
          </div>
          {app.decision_notes}
        </div>
      )}
    </div>
  );
}

function SuggestedFounderRow({ f }: { f: FounderPublic }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-mute-100 flex items-center justify-center text-sm font-semibold text-mute-700 overflow-hidden shrink-0">
        {f.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={f.photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          f.full_name?.[0] || "?"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{f.full_name}</div>
        <div className="text-xs text-mute-500 truncate">{f.headline}</div>
        <Link
          href={`/founders/${f.id}`}
          className="text-xs text-brand hover:text-brand-deep mt-1 inline-block"
        >
          View profile
        </Link>
      </div>
    </div>
  );
}
