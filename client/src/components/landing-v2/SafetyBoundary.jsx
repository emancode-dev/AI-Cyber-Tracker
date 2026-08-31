import Reveal from "./Reveal";

function SafetyBoundary() {
  return (
    <section className="story-section safety-section">
      <div className="page-width safety-grid">
        <Reveal className="story-heading">
          <span className="cyber-kicker"><span/>A BOUNDARY BY DESIGN</span>
          <h2>Is this an aggressive hacking tool?</h2>
          <p className="conversation-answer">No. And that boundary matters.</p>
          <p>Cyber AI Tracker is designed for defensive assessment of websites you own or are explicitly authorized to assess.</p>
          <div className="boundary-list"><span>× No brute force</span><span>× No credential stuffing</span><span>× No destructive exploitation</span><span>× No “100% secure” claims</span></div>
        </Reveal>
        <Reveal className="shield-visual" delay={100}>
          <div className="shield-grid"/><div className="shield-core"><span>AUTHORIZED</span><strong>PASSIVE ONLY</strong></div>
          <div className="attack-line attack-line-a"><span>BRUTE FORCE</span><i/></div>
          <div className="attack-line attack-line-b"><span>DESTRUCTIVE</span><i/></div>
          <div className="safe-line"><span>PUBLIC SIGNALS</span><i/></div>
        </Reveal>
      </div>
    </section>
  );
}

export default SafetyBoundary;
