import Reveal from "./Reveal";

const risks = [
  { label: "HSTS", className: "risk-pin-a" },
  { label: "Cookie flags", className: "risk-pin-b" },
  { label: "CSP", className: "risk-pin-c" },
  { label: "Redirects", className: "risk-pin-d" },
  { label: "TLS", className: "risk-pin-e" }
];

function HiddenRiskScene() {
  return (
    <section className="story-section hidden-risk-section" id="how-it-works">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center">
          <span className="cyber-kicker"><span/>THE PROBLEM</span>
          <h2>Your website can look completely fine.</h2>
          <p>That doesn’t mean the signals around it are telling the same story.</p>
        </Reveal>

        <Reveal className="browser-risk-stage" delay={80}>
          <div className="browser-window">
            <div className="browser-bar"><span/><span/><span/><div>🔒 https://yourwebsite.com</div></div>
            <div className="browser-body">
              <div className="browser-copy"><small>YOUR PRODUCT</small><strong>Everything looks normal.</strong><span>Until you inspect what the browser and server are actually exposing.</span></div>
              <div className="browser-product-card"><i/><i/><i/></div>
            </div>
          </div>
          {risks.map((risk, index) => <div key={risk.label} className={`risk-pin ${risk.className}`} style={{ "--pin-delay": `${index * 140 + 250}ms` }}><i/><span>{risk.label}</span></div>)}
          <div className="risk-scan-line" />
        </Reveal>

        <Reveal className="story-punchline">
          <strong>Looking fine isn’t the same as knowing what’s exposed.</strong>
        </Reveal>
      </div>
    </section>
  );
}

export default HiddenRiskScene;
