import { CheckCircle, Fingerprint, LockKey, ShieldCheck } from "@phosphor-icons/react";
import Brand from "../emerald/Brand";

const proof = [
  [ShieldCheck, "Row-level access", "Every workspace query is scoped to the signed-in owner."],
  [LockKey, "Protected API", "Bearer tokens are verified before protected scan operations."],
  [Fingerprint, "Privacy by design", "Detailed assessment data can expire or be deleted on demand."]
];

function AuthShell({ eyebrow, title, description, children }) {
  return (
    <main className="em-auth-page">
      <section className="em-auth-visual" aria-label="Cyber AI Tracker security overview">
        <Brand />
        <div className="em-auth-visual-copy">
          <span className="em-section-label">EVIDENCE-FIRST SECURITY</span>
          <h1>See the exposure.<br />Secure the next move.</h1>
          <p>Turn public website signals into a clear security score and a practical, prioritized roadmap.</p>
        </div>
        <div className="em-auth-signal-card" aria-hidden="true">
          <span><i /> LIVE SECURITY SIGNAL</span>
          <strong>Encrypted workspace session</strong>
          <div><b>TLS</b><b>HEADERS</b><b>PRIVACY</b></div>
        </div>
        <div className="em-auth-proof">
          {proof.map(([Icon, heading, text]) => (
            <article key={heading}>
              <Icon weight="duotone" />
              <div><strong>{heading}</strong><small>{text}</small></div>
            </article>
          ))}
        </div>
      </section>
      <section className="em-auth-form-side">
        <div className="em-auth-form-card">
          <div className="em-auth-mobile-brand"><Brand compact /></div>
          <span className="em-section-label">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="em-auth-description">{description}</p>
          {children}
          <div className="em-auth-trust"><CheckCircle weight="fill" /> Protected by Supabase Auth and database RLS</div>
        </div>
      </section>
    </main>
  );
}

export default AuthShell;
