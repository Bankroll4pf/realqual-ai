export const leadTypes = ["buyer", "seller", "renter", "investor"] as const;
export const timelines = ["immediate", "0-30 days", "31-90 days", "3-6 months", "6+ months"] as const;
export const preApprovalStatuses = ["pre-approved", "not yet", "cash buyer", "unknown"] as const;
export const agentStatuses = ["yes", "no", "unknown"] as const;
export const temperatures = ["hot", "warm", "cold"] as const;

export type LeadType = (typeof leadTypes)[number];
export type Timeline = (typeof timelines)[number];
export type PreApprovalStatus = (typeof preApprovalStatuses)[number];
export type AgentStatus = (typeof agentStatuses)[number];
export type LeadTemperature = (typeof temperatures)[number];

export type LeadInput = {
  fullName: string;
  email: string;
  phone: string;
  leadType: LeadType;
  targetArea: string;
  budgetOrValue: string;
  timeline: Timeline;
  preApprovalStatus: PreApprovalStatus;
  workingWithAgent: AgentStatus;
  notes: string;
};

export type LeadQualification = {
  summary: string;
  qualifiedLeadType: LeadType;
  temperature: LeadTemperature;
  score: number;
  reasoning: string;
  recommendedNextAction: string;
  agentMessage: string;
  complianceNotes: string;
};

export type LeadRecord = LeadInput &
  LeadQualification & {
    id: string;
    createdAt: string;
  };

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: Record<string, string> };
