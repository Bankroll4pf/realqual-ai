return {
  ok: true,
  data: {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    leadType: leadType as LeadInput["leadType"],
    targetArea: data.targetArea,
    budgetOrValue: data.budgetOrValue,
    timeline: timeline as LeadInput["timeline"],
    preApprovalStatus: preApprovalStatus as LeadInput["preApprovalStatus"],
    workingWithAgent: workingWithAgent as LeadInput["workingWithAgent"],
    notes: data.notes
  }
};
