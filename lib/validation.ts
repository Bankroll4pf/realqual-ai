import {
  agentStatuses,
  leadTypes,
  preApprovalStatuses,
  timelines,
  type LeadInput,
  type ValidationResult
} from "./types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isOneOf<T extends readonly string[]>(value: string, options: T): value is T[number] {
  return options.includes(value);
}

export function validateLeadInput(payload: unknown): ValidationResult<LeadInput> {
  const source = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};

  const data = {
    fullName: clean(source.fullName),
    email: clean(source.email).toLowerCase(),
    phone: clean(source.phone),
    leadType: clean(source.leadType),
    targetArea: clean(source.targetArea),
    budgetOrValue: clean(source.budgetOrValue),
    timeline: clean(source.timeline),
    preApprovalStatus: clean(source.preApprovalStatus),
    workingWithAgent: clean(source.workingWithAgent),
    notes: clean(source.notes)
  };

  const errors: Record<string, string> = {};

  if (data.fullName.length < 2) errors.fullName = "Enter the lead's full name.";
  if (!emailPattern.test(data.email)) errors.email = "Enter a valid email address.";
  if (data.phone.replace(/\D/g, "").length < 7) errors.phone = "Enter a valid phone number.";
  if (!isOneOf(data.leadType, leadTypes)) errors.leadType = "Select a valid lead type.";
  if (data.targetArea.length < 2) errors.targetArea = "Enter a target city or area.";
  if (data.budgetOrValue.length < 2) errors.budgetOrValue = "Enter a budget or estimated value.";
  if (!isOneOf(data.timeline, timelines)) errors.timeline = "Select a valid timeline.";
  if (!isOneOf(data.preApprovalStatus, preApprovalStatuses)) {
    errors.preApprovalStatus = "Select a valid pre-approval status.";
  }
  if (!isOneOf(data.workingWithAgent, agentStatuses)) {
    errors.workingWithAgent = "Select whether they are working with an agent.";
  }
  if (data.notes.length > 2000) errors.notes = "Notes must be under 2,000 characters.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      leadType: data.leadType,
      targetArea: data.targetArea,
      budgetOrValue: data.budgetOrValue,
      timeline: data.timeline,
      preApprovalStatus: data.preApprovalStatus,
      workingWithAgent: data.workingWithAgent,
      notes: data.notes
    }
  };
}
