import Link from "next/link";
import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const leads = await listLeads();

  return (
    <main className="shell">
      <header className="nav">
        <Link href="/" className="brand">
          <span className="brand-mark">RQ</span>
          <span>RealQual AI</span>
        </Link>
        <Link className="button primary" href="/#intake">
          Add lead
        </Link>
      </header>

      <section className="dashboard-header">
        <div>
          <p className="eyebrow">Sales dashboard</p>
          <h1>Qualified leads</h1>
          <p className="muted">Every intake submission is saved with AI summary, score, status, and next action.</p>
        </div>
        <span className="button">{leads.length} total</span>
      </section>

      {leads.length === 0 ? (
        <div className="empty">
          <h2>No leads yet</h2>
          <p className="muted">Submit a lead from the intake form to populate the dashboard.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Type</th>
                <th>Score</th>
                <th>Status</th>
                <th>Summary</th>
                <th>Reasoning</th>
                <th>Recommended next action</th>
                <th>Agent message</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <strong>{lead.fullName}</strong>
                    <div className="muted">{lead.email}</div>
                    <div className="muted">{lead.phone}</div>
                  </td>
                  <td>
                    <strong>{lead.leadType}</strong>
                    <div className="muted">{lead.targetArea}</div>
                  </td>
                  <td>
                    <strong>{lead.score}/100</strong>
                  </td>
                  <td>
                    <span className={`badge ${lead.temperature}`}>{lead.temperature}</span>
                  </td>
                  <td>{lead.summary}</td>
                  <td>{lead.reasoning}</td>
                  <td>{lead.recommendedNextAction}</td>
                  <td>{lead.agentMessage}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
