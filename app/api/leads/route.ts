import { NextResponse } from "next/server";
import { qualifyLeadWithAI } from "@/lib/ai";
import { listLeads, saveLead } from "@/lib/store";
import type { LeadRecord } from "@/lib/types";
import { validateLeadInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load leads." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateLeadInput(body);

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
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message.includes("OpenAI")
            ? "AI qualification failed. Check OPENAI_API_KEY and OPENAI_MODEL."
            : "Unable to qualify lead."
      },
      { status: 500 }
    );
  }
}
