function SecurityCoreScene() {
  return (
    <section className="v3-core-scroll">
      <div className="v3-core-sticky">
        <div className="v3-core-stage v3-page">
          <div className="v3-core-orb">
            <div className="v3-core-globe"><span className="globe-line l1"/><span className="globe-line l2"/><span className="globe-line l3"/><span className="globe-line l4"/><div><small>SECURITY</small><strong>CORE</strong></div></div>
            <span className="v3-core-node transport">HTTPS · TLS</span>
            <span className="v3-core-node headers">HEADERS</span>
            <span className="v3-core-node cookies">COOKIES</span>
            <span className="v3-core-node context">FORMS · META</span>
            <div className="v3-core-beam" />
            <div className="v3-normalized-pill"><small>NORMALIZED FINDING</small><strong>HSTS_MISSING</strong><span>headers · medium · high confidence</span></div>
          </div>
          <div className="v3-core-narrative">
            <span className="v3-kicker"><span />WATCH THE PIPELINE</span><h2>The evidence builds while you scroll.</h2><p>The visual stays in place while transport, browser controls, session signals and public context join the assessment.</p>
            <ol><li><b>01</b><span><strong>Transport</strong><small>URL → DNS → HTTP → redirect → TLS</small></span></li><li><b>02</b><span><strong>Browser controls</strong><small>CSP, HSTS, framing and policy signals</small></span></li><li><b>03</b><span><strong>Session surface</strong><small>Visible Secure, HttpOnly and SameSite attributes</small></span></li><li><b>04</b><span><strong>Normalization</strong><small>One stable JSON shape for every finding</small></span></li></ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SecurityCoreScene;
