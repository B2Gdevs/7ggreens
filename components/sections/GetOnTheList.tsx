"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Identified } from "gad-visual-context";

export function GetOnTheList() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("submitting");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, zip, newsletter: optIn }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setState("error");
        setMessage(data.message || "Something went wrong. Please try again.");
        return;
      }
      setState("success");
      setMessage(data.message || "You're on the list. We'll be in touch.");
    } catch {
      setState("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <Identified
      as="lead-capture"
      cid="home.lead-capture"
      tag="section"
      className="py-[var(--section-py)]"
    >
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--section-px)]">
        <div className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-cream)] p-8 md:p-16">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="eyebrow">Stay in season</p>
              <h2
                className="font-display mt-4 leading-[1.05] text-[var(--color-charcoal)]"
                style={{ fontSize: "var(--text-display-md)" }}
              >
                Get on the list.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-charcoal-soft)]">
                We'll email you when boxes open for the season — and only then. No filler, no spam, no daily emails.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              data-cid="home.lead-capture.form"
              className="md:col-span-7"
              noValidate
            >
              {state === "success" ? (
                <div
                  role="status"
                  className="flex items-start gap-4 rounded-2xl border border-[var(--color-sage)]/30 bg-[var(--color-sage)]/8 p-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-sage-deep)] text-[var(--color-cream)]">
                    <Check size={18} strokeWidth={2.4} />
                  </div>
                  <div>
                    <p className="font-display text-2xl text-[var(--color-charcoal)]">You're on the list.</p>
                    <p className="mt-2 text-sm text-[var(--color-charcoal-soft)]">{message}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    label="Name"
                    id="lead-name"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                    placeholder="First last"
                  />
                  <Field
                    label="Zip code"
                    id="lead-zip"
                    value={zip}
                    onChange={setZip}
                    autoComplete="postal-code"
                    placeholder="75007"
                    pattern="\d{5}"
                  />
                  <div className="md:col-span-2">
                    <Field
                      label="Email"
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                    />
                  </div>

                  <label className="md:col-span-2 mt-2 flex items-start gap-3 text-sm text-[var(--color-charcoal-soft)]">
                    <input
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[var(--color-sage-deep)]"
                    />
                    <span>
                      Send me season updates and box availability. Unsubscribe any time.
                    </span>
                  </label>

                  <div className="md:col-span-2 mt-2 flex items-center justify-between gap-4">
                    <p className="text-xs text-[var(--color-charcoal-muted)]">
                      Serving East Texas + Dallas–Fort Worth.
                    </p>
                    <button type="submit" className="btn-primary" disabled={state === "submitting"}>
                      {state === "submitting" ? "Sending…" : (
                        <>
                          Get on the list
                          <ArrowRight size={16} strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </div>

                  {state === "error" && (
                    <p className="md:col-span-2 text-sm text-[var(--color-tomato-deep)]">{message}</p>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Identified>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  autoComplete,
  pattern,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  pattern?: string;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-charcoal-muted)]">
        {label}{required && <span className="text-[var(--color-tomato-deep)]"> *</span>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        pattern={pattern}
        className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-cream-soft)]/50 px-4 py-3 text-base font-medium text-[var(--color-charcoal)] placeholder:text-[var(--color-charcoal-muted)] focus:border-[var(--color-sage-deep)] focus:bg-[var(--color-cream)] focus:outline-none"
      />
    </label>
  );
}
