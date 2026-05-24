import Link from "next/link";
import { LeadIntakeForm } from "@/components/LeadIntakeForm";

export default function HomePage() {
  return (
    <main>
      <header className="shell nav">
        <Link href="/" className="brand">
          <span className="brand-mark">RQ</span>
          <span>RealQual AI</span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link className="button" href="/dashboard">
            Dashboard
          </Link>
          <a className="button primary" href="#intake">
            Qualify a lead
          </a>
        </nav>
      </header>

      <section className="shell hero">
        <div>
          <p className="eyebrow">AI lead qualification for real estate teams</p>
          <h1>Turn raw inquiries into sales-ready next steps.</h1>
          <p>
            RealQual AI helps agents prioritize new buyer, seller, renter, and investor leads with a concise
            summary, compliant temperature score, and recommended follow-up action.
          </p>
          <div className="nav-links">
            <a className="button primary" href="#intake">
              Try the intake
            </a>
            <Link className="button" href="/dashboard">
              View lead dashboard
            </Link>
          </div>
        </div>

        <aside className="hero-card" aria-label="Qualification preview">
          <p className="eyebrow">Agent output</p>
          <h2>Prioritized pipeline view</h2>
          <div className="signal-list">
            <div className="signal">
              <span className="score hot">91</span>
              <div>
                <strong>Hot seller</strong>
                <p className="muted">Ready within 30 days. Confirm pricing motivation and book listing consult.</p>
              </div>
            </div>
            <div className="signal">
              <span className="score warm">68</span>
              <div>
                <strong>Warm buyer</strong>
                <p className="muted">Budget and area known. Verify financing and schedule discovery call.</p>
              </div>
            </div>
            <div className="signal">
              <span className="score cold">36</span>
              <div>
                <strong>Cold renter</strong>
                <p className="muted">Longer timeline. Place into nurture and ask one clarifying question.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="shell section-grid" id="intake">
        <aside className="panel">
          <p className="eyebrow">Built for sales motion</p>
          <h2>Simple enough for agents, structured enough for a CRM.</h2>
          <p>
            The assistant evaluates business-relevant factors like intent, timeline, budget clarity, financing
            readiness, contactability, and current agent relationship.
          </p>
          <ul className="feature-list">
            <li>Structured AI output for summary, score, temperature, and next best action.</li>
            <li>Supabase storage when configured, with a local JSON fallback for development.</li>
            <li>Fair Housing guardrails built into the system prompt and compliance note.</li>
          </ul>
        </aside>

        <section className="form-card">
          <p className="eyebrow">Lead intake</p>
          <h2>Qualify a new lead</h2>
          <LeadIntakeForm />
        </section>
      </section>
    </main>
  );
}
