function SafetyBoundary() {
  return (
    <section className="v3-safety-section">
      <div className="v3-page v3-safety-grid">
        <div className="v3-safety-copy" data-reveal><span className="v3-kicker"><span />THE BOUNDARY</span><h2>“Is this an aggressive hacking tool?”</h2><strong>No. That line matters.</strong><p>Cyber AI Tracker is designed around defensive assessment of websites you own or are explicitly authorized to evaluate.</p><ul><li>No brute force</li><li>No destructive exploitation</li><li>No credential stuffing</li><li>No database dumping</li></ul></div>
        <div className="v3-boundary-visual" data-reveal>
          <div className="v3-boundary-label left">REQUESTS</div><div className="v3-boundary-label right">TARGET</div>
          <div className="v3-lane unsafe"><span>Brute force</span><i/><b>BLOCKED</b></div>
          <div className="v3-lane unsafe second"><span>Exploit payload</span><i/><b>BLOCKED</b></div>
          <div className="v3-lane safe"><span>Passive HTTP</span><i/><b>OBSERVE</b></div>
          <div className="v3-lane safe second"><span>Public metadata</span><i/><b>OBSERVE</b></div>
          <div className="v3-shield"><span>SAFE<br/>BOUNDARY</span><i/><i/><i/></div>
        </div>
      </div>
    </section>
  );
}

export default SafetyBoundary;
