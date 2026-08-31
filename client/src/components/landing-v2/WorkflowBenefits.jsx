import Reveal from "./Reveal";

const steps = [
  ["01", "Add website", "Save a website you own or are authorized to assess."],
  ["02", "Confirm authorization", "Make the assessment boundary explicit before scanning."],
  ["03", "Run safe scan", "Collect focused HTTP, TLS, header, cookie and metadata signals."],
  ["04", "Add owner context", "Answer only the questions that become relevant to your application."],
  ["05", "Calculate risk", "Deterministic rules combine findings and context into a reproducible score."],
  ["06", "Prioritize action", "Use the evidence, score and later AI explanation to decide what to fix first."]
];

const benefits = [
  ["01", "Know what to fix first", "Stop treating every technical signal as equally urgent."],
  ["02", "Understand the finding", "See what was observed, why it matters and how confident the tool is."],
  ["03", "Catch invisible context", "Bring backups, admin access, payments and data practices into the picture."],
  ["04", "Track improvement", "Use rescans and score history later to make progress visible."],
  ["05", "Keep context minimal", "The AI layer is designed to receive only what it actually needs."],
  ["06", "Keep the product useful without AI", "Scanning and deterministic scoring remain the source of truth."]
];

function WorkflowBenefits() {
  return (
    <section className="story-section workflow-benefits-section">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center">
          <span className="cyber-kicker"><span/>THE ACTUAL PRODUCT LOOP</span>
          <h2>From “scan my site” to “here’s what I should do next.”</h2>
          <p>The journey stays simple even though several security layers work underneath it.</p>
        </Reveal>
        <div className="workflow-line-v2">
          {steps.map(([number,title,copy],index) => <Reveal className="workflow-step-v2" delay={index*55} key={number}><i>{number}</i><strong>{title}</strong><span>{copy}</span></Reveal>)}
        </div>

        <Reveal className="benefit-heading-v2"><span className="cyber-kicker"><span/>WHAT YOU ACTUALLY GAIN</span><h3>Features matter less than what they help you understand.</h3></Reveal>
        <div className="benefit-grid-v2">
          {benefits.map(([number,title,copy],index) => <Reveal className="benefit-card-v2" delay={index*45} key={number}><small>{number}</small><div className="benefit-icon-v2"><i/><i/><i/></div><strong>{title}</strong><p>{copy}</p></Reveal>)}
        </div>

        <Reveal className="product-principle-card" delay={120}>
          <span>PRODUCT PRINCIPLE</span>
          <blockquote>“The goal is not to produce the biggest security report. It is to make verified evidence understandable enough that someone can act on it.”</blockquote>
          <div><i>CA</i><span><strong>Cyber AI Tracker</strong><small>Assessment philosophy</small></span></div>
        </Reveal>
      </div>
    </section>
  );
}

export default WorkflowBenefits;
