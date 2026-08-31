const risks = [
  ["HSTS", "Missing transport enforcement", "pin-a"],
  ["COOKIE", "Session flags need review", "pin-b"],
  ["CSP", "Content restrictions absent", "pin-c"],
  ["REDIRECT", "Destination chain observed", "pin-d"],
  ["TLS", "Certificate metadata", "pin-e"]
];

function HiddenRiskScene() {
  return (
    <section className="v3-hidden-risk v3-scrollytelling" id="story">
      <div className="v3-page v3-split-heading" data-reveal>
        <div><span className="v3-kicker"><span />THE FIRST QUESTION</span><h2>Your website can look completely fine.</h2></div>
        <p>That only tells you the interface loaded. The interesting signals often live in the request, response and configuration around it.</p>
      </div>
      <div className="v3-page v3-browser-wrap">
        <div className="v3-browser-stage">
          <div className="v3-browser-chrome"><span className="dots"><i/><i/><i/></span><div><b>◉</b> https://yourwebsite.example</div><span>⋯</span></div>
          <div className="v3-browser-site">
            <div className="v3-demo-nav"><b>NORTH/01</b><span>Product</span><span>Stories</span><span>Contact</span><i>Get started</i></div>
            <div className="v3-demo-hero"><small>EVERYTHING LOOKS NORMAL</small><h3>A polished interface can still hide configuration signals.</h3><p>The outside world sees more than your layout.</p><button type="button">Explore product</button></div>
            <div className="v3-demo-visual"><span/><span/><span/></div>
          </div>
          {risks.map(([name, copy, className]) => <div className={`v3-risk-pin ${className}`} key={name}><i/><div><strong>{name}</strong><small>{copy}</small></div></div>)}
          <div className="v3-scan-line" />
        </div>
        <p className="v3-big-statement" data-reveal>Looking fine <em>isn’t</em> the same as knowing what’s exposed.</p>
      </div>
    </section>
  );
}

export default HiddenRiskScene;
