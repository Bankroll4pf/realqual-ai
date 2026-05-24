import { NextResponse } from "next/server";
import { qualifyLeadWithAI } from "@/lib/ai";
import { saveLead } from "@/lib/store";
import type { LeadInput, LeadRecord } from "@/lib/types";
import { validateLeadInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

type GoogleFormPayload = {
  secret?: string;
  row?: Record<string, unknown>;
};

const aliases = {
  fullName: ["full name", "name", "lead name"],
  email: ["email", "email address"],
  phone: ["phone", "phone number", "mobile"],
  leadType: ["lead type", "type"],
  targetArea: ["target city/area", "target city", "target area", "city", "area", "location interest"],
  budgetOrValue: ["budget or estimated property value", "budget", "estimated property value", "property value"],
  timeline: ["timeline", "timeframe", "buying/selling timeline"],
  preApprovalStatus: ["pre-approval status", "preapproval status", "financing readiness", "financing status"],
  workingWithAgent: ["currently working with an agent", "working with an agent", "has agent"],
  notes: ["notes", "additional notes", "message"]
} satisfies Record<keyof LeadInput, string[]>;

function normalizedKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function valueFor(row: Record<string, unknown>, candidates: string[]) {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [normalizedKey(key), value] as const);
  const match = normalizedEntries.find(([key]) => candidates.map(normalizedKey).includes(key));
  return typeof match?.[1] === "string" ? match[1] : "";
}

function normalizeLeadType(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("seller")) return "seller";
  if (lower.includes("rent")) return "renter";
  if (lower.includes("invest")) return "investor";
  return "buyer";
}

function normalizeTimeline(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("immediate") || lower.includes("now") || lower.includes("asap")) return "immediate";
  if (lower.includes("30")) return "0-30 days";
  if (lower.includes("90")) return "31-90 days";
  if (lower.includes("6+")) return "6+ months";
  if (lower.includes("6")) return "3-6 months";
  return "31-90 days";
}

function normalizePreApproval(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("cash")) return "cash buyer";
  if (lower.includes("pre") || lower.includes("approved")) return "pre-approved";
  if (lower.includes("no") || lower.includes("not")) return "not yet";
  return "unknown";
}

function normalizeAgentStatus(value: string) {
  const lower = value.toLowerCase();
  if (lower.startsWith("y")) return "yes";
  if (lower.startsWith("n")) return "no";
  return "unknown";
}

function mapGoogleFormRow(row: Record<string, unknown>): LeadInput {
  return {
    fullName: valueFor(row, aliases.fullName),
    email: valueFor(row, aliases.email),
    phone: valueFor(row, aliases.phone),
    leadType: normalizeLeadType(valueFor(row, aliases.leadType)),
    targetArea: valueFor(row, aliases.targetArea),
    budgetOrValue: valueFor(row, aliases.budgetOrValue),
    timeline: normalizeTimeline(valueFor(row, aliases.timeline)),
    preApprovalStatus: normalizePreApproval(valueFor(row, aliases.preApprovalStatus)),
    workingWithAgent: normalizeAgentStatus(valueFor(row, aliases.workingWithAgent)),
    notes: valueFor(row, aliases.notes)
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GoogleFormPayload;
    const expectedSecret = process.env.GOOGLE_FORM_WEBHOOK_SECRET;

    if (expectedSecret && payload.secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized webhook request." }, { status: 401 });
    }

    if (!payload.row || typeof payload.row !== "object") {
      return NextResponse.json({ error: "Missing Google Form row payload." }, { status: 400 });
    }

    const mappedLead = mapGoogleFormRow(payload.row);
    const validation = validateLeadInput(mappedLead);

    if (!validation.ok) {
      return NextResponse.json({ error: "Validation failed.", fields: validation.errors }, { status: 400 });
    }

    const qualification = await qualifyLeadWithAI(validation.data);
    const lead: LeadRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...validation.data,
      ...qualification
    };

    const savedLead = await saveLead(lead);
    return NextResponse.json({ lead: savedLead }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to process Google Form submission." }, { status: 500 });
  }
}
