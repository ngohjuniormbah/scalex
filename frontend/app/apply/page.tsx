"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

type FormState = {
  full_name: string;
  email: string;
  password: string;
  bio: string;
  linkedin: string;
  location: string;
  company_name: string;
  stage: string;
  sector: string;
  website: string;
  revenue: string;
  users: string;
  growth_rate: string;
  previous_funding: string;
  vision: string;
  market: string;
  team: string;
};

const empty: FormState = {
  full_name: "",
  email: "",
  password: "",
  bio: "",
  linkedin: "",
  location: "",
  company_name: "",
  stage: "pre-seed",
  sector: "ai",
  website: "",
  revenue: "",
  users: "",
  growth_rate: "",
  previous_funding: "",
  vision: "",
  market: "",
  team: "",
};

const TOTAL = 5;

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(TOTAL, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // Register account first
      const auth = await api.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
      });
      localStorage.setItem("scalex_token", auth.token);

      // Then submit application payload
      await api.submitApplication({
        bio: form.bio,
        linkedin: form.linkedin,
        location: form.location,
        company_name: form.company_name,
        stage: form.stage,
        sector: form.sector,
        website: form.website,
        revenue: form.revenue,
        users: form.users,
        growth_rate: form.growth_rate,
        previous_funding: form.previous_funding,
        vision: form.vision,
        market: form.market,
        team: form.team,
      });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-paper">
      {/* Top bar */}
      <div className="border-b border-mute-200">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tightest">
            scale<span className="text-brand">x</span>
          </Link>
          <div className="text-xs font-mono text-mute-500">
            Step {step} of {TOTAL}
          </div>
        </div>
        <div className="h-1 bg-mute-100">
          <div
            className="h-full bg-brand transition-all duration-500"
            style={{ width: `${(step / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <Section
                eyebrow="01 · Account"
                title="Let's start with you."
                body="We'll create your ScaleX account. You can always edit this later."
              >
                <Field label="Full name">
                  <input
                    className={inputCls}
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    placeholder="Jane Doe"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="jane@company.com"
                  />
                </Field>
                <Field label="Password">
                  <input
                    type="password"
                    className={inputCls}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </Field>
              </Section>
            )}

            {step === 2 && (
              <Section
                eyebrow="02 · Founder profile"
                title="Tell us about you."
                body="A short bio helps us understand who you are and what you've built."
              >
                <Field label="Short bio">
                  <textarea
                    className={`${inputCls} min-h-[140px]`}
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Three sentences on your background and why you're building this."
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <input
                    className={inputCls}
                    value={form.linkedin}
                    onChange={(e) => update("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputCls}
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="City, Country"
                  />
                </Field>
              </Section>
            )}

            {step === 3 && (
              <Section
                eyebrow="03 · Company"
                title="What are you building?"
                body="The basics about the company. Keep it crisp."
              >
                <Field label="Company name">
                  <input
                    className={inputCls}
                    value={form.company_name}
                    onChange={(e) => update("company_name", e.target.value)}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Stage">
                    <select
                      className={inputCls}
                      value={form.stage}
                      onChange={(e) => update("stage", e.target.value)}
                    >
                      <option value="pre-seed">Pre-seed</option>
                      <option value="seed">Seed</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B+</option>
                    </select>
                  </Field>
                  <Field label="Sector">
                    <select
                      className={inputCls}
                      value={form.sector}
                      onChange={(e) => update("sector", e.target.value)}
                    >
                      <option value="ai">AI</option>
                      <option value="fintech">Fintech</option>
                      <option value="climate">Climate</option>
                      <option value="biotech">Biotech</option>
                      <option value="deeptech">Deep tech</option>
                      <option value="devtools">Developer tools</option>
                    </select>
                  </Field>
                </div>
                <Field label="Website">
                  <input
                    className={inputCls}
                    value={form.website}
                    onChange={(e) => update("website", e.target.value)}
                    placeholder="https://"
                  />
                </Field>
              </Section>
            )}

            {step === 4 && (
              <Section
                eyebrow="04 · Traction"
                title="Show us the numbers."
                body="Be honest. Zeros are fine — story and growth trajectory matter more than absolutes."
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Monthly revenue (USD)">
                    <input
                      className={inputCls}
                      value={form.revenue}
                      onChange={(e) => update("revenue", e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                  <Field label="Active users">
                    <input
                      className={inputCls}
                      value={form.users}
                      onChange={(e) => update("users", e.target.value)}
                      placeholder="0"
                    />
                  </Field>
                </div>
                <Field label="Monthly growth rate">
                  <input
                    className={inputCls}
                    value={form.growth_rate}
                    onChange={(e) => update("growth_rate", e.target.value)}
                    placeholder="e.g., 20% MoM"
                  />
                </Field>
                <Field label="Previous funding">
                  <input
                    className={inputCls}
                    value={form.previous_funding}
                    onChange={(e) =>
                      update("previous_funding", e.target.value)
                    }
                    placeholder="e.g., $500k pre-seed from Angel Collective"
                  />
                </Field>
              </Section>
            )}

            {step === 5 && (
              <Section
                eyebrow="05 · Vision"
                title="Why you, why now?"
                body="Three short answers. We read every word."
              >
                <Field label="What's your vision in ten years?">
                  <textarea
                    className={`${inputCls} min-h-[100px]`}
                    value={form.vision}
                    onChange={(e) => update("vision", e.target.value)}
                  />
                </Field>
                <Field label="Why is the market ready?">
                  <textarea
                    className={`${inputCls} min-h-[100px]`}
                    value={form.market}
                    onChange={(e) => update("market", e.target.value)}
                  />
                </Field>
                <Field label="Why is your team the right team?">
                  <textarea
                    className={`${inputCls} min-h-[100px]`}
                    value={form.team}
                    onChange={(e) => update("team", e.target.value)}
                  />
                </Field>
              </Section>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 1}
            className="text-sm text-mute-500 hover:text-ink disabled:opacity-30"
          >
            ← Back
          </button>

          {step < TOTAL ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white font-medium px-6 py-3"
            >
              Continue <span aria-hidden>→</span>
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-brand hover:bg-brand-deep transition-colors text-white font-medium px-6 py-3 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit application →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-lg border border-mute-200 bg-white px-4 py-3 text-ink placeholder:text-mute-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

function Section({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-brand mb-3 font-mono">
        {eyebrow}
      </p>
      <h1 className="display text-3xl md:text-4xl text-ink mb-3">{title}</h1>
      <p className="text-mute-500 mb-8">{body}</p>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-2">{label}</span>
      {children}
    </label>
  );
}
