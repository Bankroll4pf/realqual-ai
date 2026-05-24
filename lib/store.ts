import { createClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { LeadRecord } from "./types";

const localPath = path.join(process.cwd(), "data", "leads.json");

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.SUPABASE_LEADS_TABLE || "leads";

  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey, table };
}

async function readLocalLeads(): Promise<LeadRecord[]> {
  try {
    const raw = await readFile(localPath, "utf8");
    return JSON.parse(raw) as LeadRecord[];
  } catch (error) {
    const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalLeads(leads: LeadRecord[]) {
  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, JSON.stringify(leads, null, 2));
}

export async function listLeads(): Promise<LeadRecord[]> {
  const config = supabaseConfig();

  if (config) {
    const supabase = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false }
    });
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as LeadRecord[];
  }

  const leads = await readLocalLeads();
  return leads.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function saveLead(lead: LeadRecord): Promise<LeadRecord> {
  const config = supabaseConfig();

  if (config) {
    const supabase = createClient(config.url, config.serviceRoleKey, {
      auth: { persistSession: false }
    });
    const { data, error } = await supabase.from(config.table).insert(lead).select("*").single();

    if (error) throw new Error(error.message);
    return data as LeadRecord;
  }

  const leads = await readLocalLeads();
  await writeLocalLeads([lead, ...leads]);
  return lead;
}
