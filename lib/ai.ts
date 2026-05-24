import type { LeadInput, LeadQualification } from "./types";

function fallbackQualification(lead: LeadInput): LeadQualification {
  return {
    summary: `${lead.fullName} is a ${lead.leadType} lead interested in ${lead.targetArea} with a ${lead.timeline} timeline.`,
    qualifiedLeadType: lead.leadType,
    temperature: "warm",
    score: 50,
    reasoning: "AI qualification fallback was used because OPENAI_API_KEY is not configured.",
    recommendedNextAction: "Review the lead manually, confirm timeline and financing, then schedule a discovery call.",
    agentMessage:
      "Thanks for reaching out. I would like to learn a little more about your goals, timing, and next steps so I can point you in the right direction.",
    complianceNotes:
      "Manual fallback used. Do not use protected characteristics when qualifying or prioritizing this lead."
  };
}

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    lead_type: { type: "string", enum: ["buyer", "seller", "renter", "investor"] },
    temperature: { type: "string", enum: ["hot", "warm", "cold"] },
    score: { type: "integer", minimum: 0, maximum: 100 },
    reasoning: { type: "string" },
    recommended_next_action: { type: "string" },
    agent_message: { type: "string" }
  },
  required: ["summary", "lead_type", "score", "temperature", "reasoning", "recommended_next_action", "agent_message"]
};

export async function qualifyLeadWithAI(lead: LeadInput): Promise<LeadQualification> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackQualification(lead);
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are a real estate lead qualification assistant.",
                "Your job is to help real estate agents understand the intent, urgency, and readiness of inbound leads.",
                "You may qualify leads based on buying/selling intent, timeline, budget or estimated property value, location interest, financing readiness, responsiveness, whether they are already working with an agent, and clarity of needs.",
                "You must never qualify, reject, prioritize, steer, or make recommendations based on protected characteristics, including race, color, religion, national origin, sex, familial status, disability, or any similar protected category.",
                "Do not ask questions about protected characteristics.",
                "If the notes include protected-class information, ignore that information when scoring and explain in reasoning that only business-relevant factors were used.",
                "Return only JSON matching the schema. Use lead_type, recommended_next_action, and agent_message keys exactly."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(lead)
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "lead_qualification",
          strict: true,
          schema
        }
      }
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI qualification failed: ${message}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
  };

  const jsonText =
    payload.output_text ??
    payload.output?.flatMap((item) => item.content ?? []).find((content) => typeof content.text === "string")?.text;

  if (!jsonText) {
    throw new Error("OpenAI response did not include qualification JSON.");
  }

  const parsed = JSON.parse(jsonText) as {
    summary: string;
    lead_type: LeadQualification["qualifiedLeadType"];
    score: number;
    temperature: LeadQualification["temperature"];
    reasoning: string;
    recommended_next_action: string;
    agent_message: string;
  };

  return {
    summary: parsed.summary,
    qualifiedLeadType: parsed.lead_type,
    temperature: parsed.temperature,
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    reasoning: parsed.reasoning,
    recommendedNextAction: parsed.recommended_next_action,
    agentMessage: parsed.agent_message,
    complianceNotes: "Qualification used only business-relevant factors and excluded protected characteristics."
  };
}
