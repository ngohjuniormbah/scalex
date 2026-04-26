"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";

type WizardState = {
  // Step 1
  email: string;
  password: string;
  confirm: string;
  full_name: string;
  // Step 2 — identity
  legal_name: string;
  date_of_birth: string;
  country: string;
  phone: string;
  // Step 3 — profile
  headline: string;
  bio: string;
  location: string;
  // Step 4 — links
  linkedin: string;
  github: string;
  twitter: string;
  website: string;
  // Step 5 — skills
  skills: string;
  sectors: string[];
  looking_for: string;
  // Step 6 — company
  company_name: string;
  one_liner: string;
  stage: string;
  sector: string;
  company_website: string;
  pitch_deck_url: string;
  incorporated_in: string;
  cofounders_count: string;
  fulltime_count: string;
  // Step 7 — traction
  revenue: string;
  users: string;
  growth_rate: string;
  previous_funding: string;
  references: string;
  // Step 8 — vision
  vision: string;
  market: string;
  team: string;
  why_now: string;
  // Step 9 — terms
  terms_accepted: boolean;
  accuracy_attested: boolean;
};

const empty: WizardState = {
  email: "",
  password: "",
  confirm: "",
  full_name: "",
  legal_name: "",
  date_of_birth: "",
  country: "",
  phone: "",
  headline: "",
  bio: "",
  location: "",
  linkedin: "",
  github: "",
  twitter: "",
  website: "",
  skills: "",
  sectors: [],
  looking_for: "",
  company_name: "",
  one_liner: "",
  stage: "pre-seed",
  sector: "ai",
  company_website: "",
  pitch_deck_url: "",
  incorporated_in: "",
  cofounders_count: "1",
  fulltime_count: "1",
  revenue: "",
  users: "",
  growth_rate: "",
  previous_funding: "",
  references: "",
  vision: "",
  market: "",
  team: "",
  why_now: "",
  terms_accepted: false,
  accuracy_attested: false,
};

const TOTAL = 9;

const STEP_NAMES = [
  "Account",
  "Identity",
  "Profile",
  "Links",
  "Skills",
  "Company",
  "Traction",
  "Vision",
  "Confirm",
];

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

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardState>(empty);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof WizardState>(k: K, v: WizardState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Per-step validation — gates the Continue button
  const stepValid = (s: number): string | null => {
    if (s === 1) {
      if (!form.email.match(/^.+@.+\..+$/)) return "Enter a valid email.";
      if (form.password.length < 8) return "Password must be 8+ characters.";
      if (/^\d+$/.test(form.password) || /^[A-Za-z]+$/.test(form.password))
        return "Password must contain both letters and numbers.";
      if (form.password !== form.confirm) return "Passwords don't match.";
      if (!form.full_name.trim()) return "Full name is required.";
    }
    if (s === 2) {
      if (!form.legal_name.trim())
        return "Legal name is required for verification.";
      if (!form.date_of_birth) return "Date of birth is required.";
      if (!form.country.trim()) return "Country is required.";
      if (!form.phone.trim()) return "Phone number is required.";
    }
    if (s === 3) {
      if (form.headline.length < 10)
        return "Write at least a 10-character headline.";
      if (form.bio.length < 100) return "Bio must be at least 100 characters.";
      if (!form.location.trim()) return "Location is required.";
    }
    if (s === 4) {
      if (!form.linkedin.match(/^https?:\/\/.+/))
        return "LinkedIn URL is required.";
    }
    if (s === 5) {
      if (form.skills.split(",").filter((s) => s.trim()).length < 3)
        return "Add at least 3 skills.";
      if (form.sectors.length < 1) return "Pick at least one sector.";
    }
    if (s === 6) {
      if (!form.company_name.trim()) return "Company name is required.";
      if (form.one_liner.length < 30)
        return "One-liner must be at least 30 characters.";
    }
    if (s === 7) {
      if (form.references.length < 50)
        return "Provide at least one reference (name + email + how they know you).";
    }
    if (s === 8) {
      if (form.vision.length < 200)
        return "Vision must be at least 200 characters.";
      if (form.market.length < 200)
        return "Market answer must be at least 200 characters.";
      if (form.team.length < 200)
        return "Team answer must be at least 200 characters.";
      if (form.why_now.length < 100)
        return "Why now must be at least 100 characters.";
    }
    if (s === 9) {
      if (!form.terms_accepted) return "You must accept the terms.";
      if (!form.accuracy_attested)
        return "You must attest to the accuracy of your application.";
    }
    return null;
  };

  function next() {
    const v = stepValid(step);
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setStep((s) => Math.min(TOTAL, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    const v = stepValid(9);
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create account
      const auth = await api.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
      });
      localStorage.setItem("scalex_token", auth.token);

      // 2. Update founder profile (created automatically via signal)
      const skills = form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateProfile({
        legal_name: form.legal_name,
        date_of_birth: form.date_of_birth || null,
        country: form.country,
        phone: form.phone,
        headline: form.headline,
        bio: form.bio,
        location: form.location,
        linkedin: form.linkedin,
        github: form.github,
        twitter: form.twitter,
        website: form.website,
        skills,
        sectors_of_interest: form.sectors,
        looking_for: form.looking_for,
      });

      // 3. Submit application
      await api.submitApplication({
        bio: form.bio,
        linkedin: form.linkedin,
        location: form.location,
        company_name: form.company_name,
        one_liner: form.one_liner,
        stage: form.stage,
        sector: form.sector,
        website: form.company_website,
        pitch_deck_url: form.pitch_deck_url,
        incorporated_in: form.incorporated_in,
        cofounders_count: parseInt(form.cofounders_count, 10) || 1,
        fulltime_count: parseInt(form.fulltime_count, 10) || 1,
        revenue: form.revenue,
        users: form.users,
        growth_rate: form.growth_rate,
        previous_funding: form.previous_funding,
        references: form.references,
        vision: form.vision,
        market: form.market,
        team: form.team,
        why_now: form.why_now,
        terms_accepted: form.terms_accepted,
        accuracy_attested: form.accuracy_attested,
      });

      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <div className="border-b border-mute-200 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tightest">
            scale<span className="text-brand">x</span>
          </Link>
          <div className="text-xs font-mono text-mute-500">
            {step}/{TOTAL} · {STEP_NAMES[step - 1]}
          </div>
        </div>
        <div className="h-1 bg-mute-100">
          <motion.div
            className="h-full bg-brand"
            initial={false}
            animate={{ width: `${(step / TOTAL) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && <Step1 form={form} update={update} />}
            {step === 2 && <Step2 form={form} update={update} />}
            {step === 3 && <Step3 form={form} update={update} />}
            {step === 4 && <Step4 form={form} update={update} />}
            {step === 5 && <Step5 form={form} update={update} />}
            {step === 6 && <Step6 form={form} update={update} />}
            {step === 7 && <Step7 form={form} update={update} />}
            {step === 8 && <Step8 form={form} update={update} />}
            {step === 9 && <Step9 form={form} update={update} />}
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
            className="text-sm text-mute-500 hover:text-ink disabled:opacity-30 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Back
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

        <div className="mt-12 text-center text-xs text-mute-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

const inp =
  "w-full rounded-lg border border-mute-200 bg-white px-4 py-2.5 text-ink placeholder:text-mute-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

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

type StepProps = {
  form: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
};

function Step1({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="01 · Account"
      title="Create your ScaleX account"
      body="This is the email and password you'll use to log in."
    >
      <Field label="Full name (as people call you)">
        <input
          className={inp}
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          className={inp}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </Field>
      <Field label="Password" hint="Minimum 8 chars, must include letters and numbers.">
        <input
          type="password"
          className={inp}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </Field>
      <Field label="Confirm password">
        <input
          type="password"
          className={inp}
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
        />
      </Field>
    </Section>
  );
}

function Step2({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="02 · Identity"
      title="Verify your identity"
      body="We use this for KYC and never display it publicly."
    >
      <Field label="Full legal name (as on government ID)">
        <input
          className={inp}
          value={form.legal_name}
          onChange={(e) => update("legal_name", e.target.value)}
        />
      </Field>
      <Field label="Date of birth">
        <input
          type="date"
          className={inp}
          value={form.date_of_birth}
          onChange={(e) => update("date_of_birth", e.target.value)}
        />
      </Field>
      <Field label="Country of residence">
        <input
          className={inp}
          value={form.country}
          onChange={(e) => update("country", e.target.value)}
        />
      </Field>
      <Field label="Phone number" hint="Include country code, e.g. +1 555 123 4567">
        <input
          className={inp}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </Field>
    </Section>
  );
}

function Step3({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="03 · Profile"
      title="Your founder profile"
      body="This is what other founders and investors will see."
    >
      <Field label="Headline" hint="One sentence on what you're building / who you are.">
        <input
          className={inp}
          value={form.headline}
          onChange={(e) => update("headline", e.target.value)}
          maxLength={160}
        />
      </Field>
      <Field
        label="Bio"
        hint={`At least 100 characters. ${form.bio.length} so far.`}
      >
        <textarea
          className={`${inp} min-h-[160px]`}
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </Field>
      <Field label="Location">
        <input
          className={inp}
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="City, Country"
        />
      </Field>
    </Section>
  );
}

function Step4({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="04 · Links"
      title="Where can we learn more?"
      body="LinkedIn is required. Other links are optional but help."
    >
      <Field label="LinkedIn URL (required)">
        <input
          className={inp}
          value={form.linkedin}
          onChange={(e) => update("linkedin", e.target.value)}
          placeholder="https://linkedin.com/in/..."
        />
      </Field>
      <Field label="GitHub">
        <input
          className={inp}
          value={form.github}
          onChange={(e) => update("github", e.target.value)}
          placeholder="https://github.com/..."
        />
      </Field>
      <Field label="Twitter / X">
        <input
          className={inp}
          value={form.twitter}
          onChange={(e) => update("twitter", e.target.value)}
        />
      </Field>
      <Field label="Personal website">
        <input
          className={inp}
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </Field>
    </Section>
  );
}

function Step5({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="05 · Skills & interests"
      title="What are you good at?"
      body="Helps other founders find you and us understand fit."
    >
      <Field label="Skills" hint="Comma-separated. At least 3.">
        <input
          className={inp}
          value={form.skills}
          onChange={(e) => update("skills", e.target.value)}
          placeholder="python, ml, fundraising, gtm"
        />
      </Field>
      <Field label="Sectors of interest">
        <div className="flex flex-wrap gap-2">
          {SECTORS.map(([val, label]) => {
            const on = form.sectors.includes(val);
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  update(
                    "sectors",
                    on
                      ? form.sectors.filter((s) => s !== val)
                      : [...form.sectors, val]
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
      <Field label="What are you primarily looking for?">
        <select
          className={inp}
          value={form.looking_for}
          onChange={(e) => update("looking_for", e.target.value)}
        >
          <option value="">Just connecting</option>
          <option value="cofounder">A co-founder</option>
          <option value="hires">Early hires</option>
          <option value="capital">Capital</option>
          <option value="advisors">Advisors</option>
        </select>
      </Field>
    </Section>
  );
}

function Step6({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="06 · Company"
      title="About what you're building"
      body="The basics. Be precise."
    >
      <Field label="Company name">
        <input
          className={inp}
          value={form.company_name}
          onChange={(e) => update("company_name", e.target.value)}
        />
      </Field>
      <Field
        label="One-liner"
        hint={`What does the company do, in one sentence? ${form.one_liner.length}/240`}
      >
        <textarea
          className={`${inp} min-h-[80px]`}
          value={form.one_liner}
          onChange={(e) => update("one_liner", e.target.value)}
          maxLength={240}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Stage">
          <select
            className={inp}
            value={form.stage}
            onChange={(e) => update("stage", e.target.value)}
          >
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
            <option value="series-b">Series B+</option>
          </select>
        </Field>
        <Field label="Primary sector">
          <select
            className={inp}
            value={form.sector}
            onChange={(e) => update("sector", e.target.value)}
          >
            {SECTORS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Website">
        <input
          className={inp}
          value={form.company_website}
          onChange={(e) => update("company_website", e.target.value)}
          placeholder="https://"
        />
      </Field>
      <Field label="Pitch deck URL" hint="Google Drive, DocSend, Notion — anything we can open.">
        <input
          className={inp}
          value={form.pitch_deck_url}
          onChange={(e) => update("pitch_deck_url", e.target.value)}
        />
      </Field>
      <Field label="Incorporated in">
        <input
          className={inp}
          value={form.incorporated_in}
          onChange={(e) => update("incorporated_in", e.target.value)}
          placeholder="Delaware, US"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Co-founders">
          <input
            type="number"
            min="1"
            className={inp}
            value={form.cofounders_count}
            onChange={(e) => update("cofounders_count", e.target.value)}
          />
        </Field>
        <Field label="Full-time team size">
          <input
            type="number"
            min="1"
            className={inp}
            value={form.fulltime_count}
            onChange={(e) => update("fulltime_count", e.target.value)}
          />
        </Field>
      </div>
    </Section>
  );
}

function Step7({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="07 · Traction"
      title="Show us where you are"
      body="Be honest. Zeros are fine. References are required."
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Monthly revenue (USD)">
          <input
            className={inp}
            value={form.revenue}
            onChange={(e) => update("revenue", e.target.value)}
            placeholder="0 / 25k / 100k"
          />
        </Field>
        <Field label="Active users">
          <input
            className={inp}
            value={form.users}
            onChange={(e) => update("users", e.target.value)}
            placeholder="0 / 1.2k / 50k"
          />
        </Field>
      </div>
      <Field label="Monthly growth rate">
        <input
          className={inp}
          value={form.growth_rate}
          onChange={(e) => update("growth_rate", e.target.value)}
          placeholder="e.g. 20% MoM"
        />
      </Field>
      <Field label="Previous funding">
        <input
          className={inp}
          value={form.previous_funding}
          onChange={(e) => update("previous_funding", e.target.value)}
          placeholder="$500k pre-seed from Angel Collective"
        />
      </Field>
      <Field
        label="References (required)"
        hint="Two people we can ask about you. Name + email + how they know you."
      >
        <textarea
          className={`${inp} min-h-[140px]`}
          value={form.references}
          onChange={(e) => update("references", e.target.value)}
          placeholder={`1. Jane Doe — jane@example.com — was my manager at Acme\n2. ...`}
        />
      </Field>
    </Section>
  );
}

function Step8({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="08 · Vision"
      title="The hard questions"
      body="Take your time. We read every word."
    >
      <Field
        label="What's your vision in 10 years?"
        hint={`Min 200 characters. ${form.vision.length} so far.`}
      >
        <textarea
          className={`${inp} min-h-[140px]`}
          value={form.vision}
          onChange={(e) => update("vision", e.target.value)}
        />
      </Field>
      <Field
        label="Why is this market ready?"
        hint={`Min 200 characters. ${form.market.length} so far.`}
      >
        <textarea
          className={`${inp} min-h-[140px]`}
          value={form.market}
          onChange={(e) => update("market", e.target.value)}
        />
      </Field>
      <Field
        label="Why is your team uniquely the right team?"
        hint={`Min 200 characters. ${form.team.length} so far.`}
      >
        <textarea
          className={`${inp} min-h-[140px]`}
          value={form.team}
          onChange={(e) => update("team", e.target.value)}
        />
      </Field>
      <Field
        label="Why now? What changed?"
        hint={`Min 100 characters. ${form.why_now.length} so far.`}
      >
        <textarea
          className={`${inp} min-h-[100px]`}
          value={form.why_now}
          onChange={(e) => update("why_now", e.target.value)}
        />
      </Field>
    </Section>
  );
}

function Step9({ form, update }: StepProps) {
  return (
    <Section
      eyebrow="09 · Confirm"
      title="Almost there"
      body="Review what you're submitting and confirm."
    >
      <div className="rounded-xl border border-mute-200 bg-mute-50 p-5 space-y-3 text-sm">
        <ConfirmRow label="Name" value={form.full_name} />
        <ConfirmRow label="Email" value={form.email} />
        <ConfirmRow label="Country" value={form.country} />
        <ConfirmRow label="Company" value={form.company_name} />
        <ConfirmRow label="Stage" value={form.stage} />
        <ConfirmRow label="Sector" value={form.sector} />
        <ConfirmRow label="Bio" value={`${form.bio.length} chars`} />
        <ConfirmRow label="Vision" value={`${form.vision.length} chars`} />
        <ConfirmRow label="Market" value={`${form.market.length} chars`} />
        <ConfirmRow label="Team" value={`${form.team.length} chars`} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.terms_accepted}
          onChange={(e) => update("terms_accepted", e.target.checked)}
          className="mt-0.5 w-4 h-4"
        />
        <span className="text-sm text-mute-700">
          I agree to the ScaleX{" "}
          <Link href="/terms" className="text-brand underline">
            terms of service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand underline">
            privacy policy
          </Link>
          .
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.accuracy_attested}
          onChange={(e) => update("accuracy_attested", e.target.checked)}
          className="mt-0.5 w-4 h-4"
        />
        <span className="text-sm text-mute-700">
          I attest that all information in this application is accurate to the
          best of my knowledge. I understand misrepresentation may result in
          immediate disqualification.
        </span>
      </label>
    </Section>
  );
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="w-4 h-4 text-brand mt-0.5 shrink-0" />
      <div className="flex-1 flex justify-between gap-3">
        <span className="text-mute-500">{label}</span>
        <span className="text-ink font-medium text-right truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}
