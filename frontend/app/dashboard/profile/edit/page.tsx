"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { api, type FounderSelf } from "@/lib/api";
import { DashboardNav } from "@/components/dashboard/Nav";

const SECTORS = [
  ["ai", "AI"],
  ["fintech", "Fintech"],
  ["climate", "Climate"],
  ["biotech", "Biotech"],
  ["deeptech", "Deep tech"],
  ["devtools", "Developer tools"],
  ["consumer", "Consumer"],
  ["enterprise", "Enterprise SaaS"],
];

const LOOKING_FOR = [
  ["", "Just connecting"],
  ["cofounder", "A co-founder"],
  ["hires", "Early hires"],
  ["capital", "Capital / investors"],
  ["advisors", "Advisors"],
];

export default function EditProfilePage() {
  const router = useRouter();
  const { me, loading, logout } = useAuth();
  const [profile, setProfile] = useState<FounderSelf | null>(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!me) return;
    api.myProfile().then((p) => {
      setProfile(p);
      setSkillsInput((p.skills || []).join(", "));
    });
  }, [me]);

  async function uploadFile(kind: "photo" | "banner", file: File) {
    setError(null);
    const setUploading =
      kind === "photo" ? setUploadingPhoto : setUploadingBanner;
    setUploading(true);
    try {
      const sig = await api.uploadUrl(kind, file.type || "image/jpeg");
      const put = await fetch(sig.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      const updated = await api.updateProfile(
        kind === "photo"
          ? { photo_url: sig.public_url }
          : { banner_url: sig.public_url }
      );
      setProfile(updated);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Upload failed. Storage may not be configured yet."
      );
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const updated = await api.updateProfile({ ...profile, skills });
      setProfile(updated);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !me || !profile) {
    return (
      <main className="min-h-screen bg-mute-50 flex items-center justify-center">
        <div className="text-mute-500 text-sm">Loading…</div>
      </main>
    );
  }

  function update<K extends keyof FounderSelf>(key: K, value: FounderSelf[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
  }

  return (
    <main className="min-h-screen bg-mute-50">
      <DashboardNav me={me} onLogout={logout} />

      <div className="mx-auto max-w-3xl px-4 md:px-6 py-8">
        <h1 className="display text-3xl mb-2">Edit profile</h1>
        <p className="text-mute-500 mb-8">
          A complete profile gets 3x more connection requests.
        </p>

        {/* Banner */}
        <div className="rounded-xl border border-mute-200 bg-white overflow-hidden mb-6">
          <div
            className="h-40 relative cursor-pointer group"
            style={{
              background: profile.banner_url
                ? `url(${profile.banner_url}) center/cover`
                : "linear-gradient(135deg, #0066FF 0%, #0A0A0A 100%)",
            }}
            onClick={() => bannerInput.current?.click()}
          >
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white flex items-center gap-2 text-sm">
                {uploadingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                Change banner
              </div>
            </div>
          </div>
          <input
            ref={bannerInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadFile("banner", f);
            }}
          />

          <div className="px-6 pb-6">
            <div className="-mt-12 mb-4">
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                className="w-24 h-24 rounded-full ring-4 ring-white bg-mute-100 overflow-hidden flex items-center justify-center text-2xl font-semibold text-mute-500 relative group"
              >
                {profile.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.photo_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  me.full_name?.[0] || "?"
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  {uploadingPhoto ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </div>
              </button>
              <input
                ref={photoInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile("photo", f);
                }}
              />
            </div>

            <Field label="Full name">
              <input
                className={input}
                value={profile.full_name}
                onChange={(e) => update("full_name", e.target.value)}
              />
            </Field>
            <Field label="Headline" hint="e.g. 'Building the future of AI infra'">
              <input
                className={input}
                value={profile.headline}
                onChange={(e) => update("headline", e.target.value)}
                maxLength={160}
              />
            </Field>
            <Field label="Bio" hint="Tell other founders who you are">
              <textarea
                className={`${input} min-h-[120px]`}
                value={profile.bio}
                onChange={(e) => update("bio", e.target.value)}
              />
            </Field>
            <Field label="Location">
              <input
                className={input}
                value={profile.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="San Francisco, CA"
              />
            </Field>
          </div>
        </div>

        <Section title="Skills & interests">
          <Field label="Skills" hint="Comma-separated, e.g. python, ml, gtm">
            <input
              className={input}
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
            />
          </Field>
          <Field label="Sectors of interest">
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(([val, label]) => {
                const on = profile.sectors_of_interest?.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      const cur = profile.sectors_of_interest || [];
                      update(
                        "sectors_of_interest",
                        on ? cur.filter((s) => s !== val) : [...cur, val]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      on
                        ? "bg-brand text-white border-brand"
                        : "bg-white text-mute-700 border-mute-200 hover:border-brand"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="What are you looking for?">
            <select
              className={input}
              value={profile.looking_for || ""}
              onChange={(e) => update("looking_for", e.target.value)}
            >
              {LOOKING_FOR.map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Links">
          <Field label="LinkedIn URL">
            <input
              className={input}
              value={profile.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/..."
            />
          </Field>
          <Field label="GitHub URL">
            <input
              className={input}
              value={profile.github}
              onChange={(e) => update("github", e.target.value)}
              placeholder="https://github.com/..."
            />
          </Field>
          <Field label="Twitter / X URL">
            <input
              className={input}
              value={profile.twitter}
              onChange={(e) => update("twitter", e.target.value)}
            />
          </Field>
          <Field label="Personal website">
            <input
              className={input}
              value={profile.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </Field>
        </Section>

        <Section title="Privacy">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.is_searchable}
              onChange={(e) => update("is_searchable", e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              Show my profile in the founder directory
            </span>
          </label>
        </Section>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand hover:bg-brand-deep text-white font-medium px-6 py-3 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-mute-500 hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

const input =
  "w-full rounded-lg border border-mute-200 bg-white px-4 py-2.5 text-ink placeholder:text-mute-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-mute-200 bg-white p-6 mb-6">
      <h2 className="font-semibold mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {hint && <span className="block text-xs text-mute-500 mb-2">{hint}</span>}
      {children}
    </label>
  );
}
