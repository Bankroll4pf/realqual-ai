"use client";

import { useState } from "react";
import {
  agentStatuses,
  leadTypes,
  preApprovalStatuses,
  timelines,
  type LeadRecord
} from "@/lib/types";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  leadType: string;
  targetArea: string;
  budgetOrValue: string;
  timeline: string;
  preApprovalStatus: string;
  workingWithAgent: string;
  notes: string;
};

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  leadType: "buyer",
  targetArea: "",
  budgetOrValue: "",
  timeline: "0-30 days",
  preApprovalStatus: "unknown",
  workingWithAgent: "unknown",
  notes: ""
};

export function LeadIntakeForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>("");
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setLead(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        setFieldErrors(payload.fields ?? {});
        setMessage(payload.error ?? "Unable to qualify this lead.");
        return;
      }

      setLead(payload.lead);
      setMessage("Lead qualified and saved.");
      setForm(initialForm);
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={submitLead}>
      {message ? <div className={lead ? "success" : "error"}>{message}</div> : null}

      <div className="field-grid">
        <Field label="Full name" error={fieldErrors.fullName}>
          <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} />
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          <input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
        </Field>
        <Field label="Phone" error={fieldErrors.phone}>
          <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
        </Field>
        <Field label="Lead type" error={fieldErrors.leadType}>
          <select value={form.leadType} onChange={(event) => updateField("leadType", event.target.value)}>
            {leadTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Target city / area" error={fieldErrors.targetArea}>
          <input value={form.targetArea} onChange={(event) => updateField("targetArea", event.target.value)} />
        </Field>
        <Field label="Budget or estimated value" error={fieldErrors.budgetOrValue}>
          <input
            value={form.budgetOrValue}
            onChange={(event) => updateField("budgetOrValue", event.target.value)}
            placeholder="$650,000"
          />
        </Field>
        <Field label="Timeline" error={fieldErrors.timeline}>
          <select value={form.timeline} onChange={(event) => updateField("timeline", event.target.value)}>
            {timelines.map((timeline) => (
              <option key={timeline} value={timeline}>
                {timeline}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pre-approval status" error={fieldErrors.preApprovalStatus}>
          <select
            value={form.preApprovalStatus}
            onChange={(event) => updateField("preApprovalStatus", event.target.value)}
          >
            {preApprovalStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Currently working with an agent" error={fieldErrors.workingWithAgent}>
          <select
            value={form.workingWithAgent}
            onChange={(event) => updateField("workingWithAgent", event.target.value)}
          >
            {agentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes" error={fieldErrors.notes}>
        <textarea
          rows={5}
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Source notes, motivation, showing requests, financing context, or objections."
        />
      </Field>

      <button className="button primary full" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Qualifying..." : "Qualify lead"}
      </button>

      {lead ? (
        <div className="result-card">
          <strong>
            {lead.temperature.toUpperCase()} · {lead.score}/100
          </strong>
          <span>{lead.summary}</span>
          <span className="muted">{lead.reasoning}</span>
          <span className="muted">{lead.recommendedNextAction}</span>
          <span>{lead.agentMessage}</span>
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      {label}
      {children}
      {error ? <span className="error">{error}</span> : null}
    </label>
  );
}
