"use client";

import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { type FounderPublic } from "@/lib/api";

function initials(name: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export function ProfileCard({
  founder,
  selfView = false,
  rightSlot,
}: {
  founder: FounderPublic;
  selfView?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-mute-200 bg-white overflow-hidden">
      {/* Banner */}
      <div
        className="h-32 md:h-44"
        style={{
          background: founder.banner_url
            ? `url(${founder.banner_url}) center/cover`
            : "linear-gradient(135deg, #0066FF 0%, #0A0A0A 100%)",
        }}
      />

      {/* Avatar row — avatar pulled up, then content sits below it */}
      <div className="px-6">
        <div className="flex items-end justify-between">
          <div className="-mt-14 md:-mt-16">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full ring-4 ring-white bg-mute-100 overflow-hidden flex items-center justify-center text-3xl font-semibold text-mute-500">
              {founder.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={founder.photo_url}
                  alt={founder.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials(founder.full_name)
              )}
            </div>
          </div>
          <div className="pb-2">{rightSlot}</div>
        </div>
      </div>

      {/* Body — separate from avatar row so nothing overlaps */}
      <div className="px-6 pt-4 pb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tightest text-ink">
            {founder.full_name || "Unnamed founder"}
          </h1>
          {founder.is_verified && (
            <span className="inline-flex items-center gap-1 text-xs text-brand bg-brand-soft px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
        {founder.headline && (
          <p className="text-mute-700 mt-1">{founder.headline}</p>
        )}
        {founder.location && (
          <p className="text-sm text-mute-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {founder.location}
          </p>
        )}

        {founder.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {founder.skills.slice(0, 8).map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-full bg-mute-100 text-mute-700"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {founder.bio && (
          <p className="mt-5 text-sm text-mute-700 leading-relaxed whitespace-pre-line">
            {founder.bio}
          </p>
        )}

        {(founder.linkedin || founder.github || founder.twitter || founder.website) && (
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {founder.linkedin && (
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                LinkedIn
              </a>
            )}
            {founder.github && (
              <a
                href={founder.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                GitHub
              </a>
            )}
            {founder.twitter && (
              <a
                href={founder.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Twitter / X
              </a>
            )}
            {founder.website && (
              <a
                href={founder.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                Website
              </a>
            )}
          </div>
        )}

        {!selfView && (founder.id !== undefined) && (
          <div className="mt-6 flex items-center gap-3">
            <Link
              href={`/founders/${founder.id}`}
              className="text-sm text-brand hover:text-brand-deep"
            >
              View full profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
