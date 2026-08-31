import { Link } from "react-router-dom";
import SecurityCoreVisual from "./SecurityCoreVisual";

function HeroScene() {
  return (
    <section className="v3-hero" id="top">
      <div className="v3-hero-aurora v3-hero-aurora-a" />
      <div className="v3-hero-aurora v3-hero-aurora-b" />
      <div className="v3-page v3-hero-layout">
        <div className="v3-hero-copy">
          <div className="v3-kicker"><span />DEFENSIVE WEBSITE SECURITY INTELLIGENCE</div>
          <h1 aria-label="Know what your website is quietly exposing">
            <span className="v3-line-mask"><span data-hero-line>Know what your website</span></span>
            <span className="v3-line-mask"><span data-hero-line>is quietly <em>exposing.</em></span></span>
          </h1>
          <p className="v3-hero-support">Cyber AI Tracker turns passive technical signals, owner context and deterministic rules into a security picture you can actually understand — then helps you decide what deserves attention first.</p>
          <div className="v3-hero-actions">
            <Link className="v3-button v3-button-primary" to="/register">Start security assessment <b>↗</b></Link>
            <a className="v3-button v3-button-ghost" href="#story">Watch how it works <b>↓</b></a>
          </div>
          <div className="v3-hero-meta"><span><i />Passive checks only</span><span><i />Deterministic scoring</span><span><i />Minimized AI context</span></div>
        </div>
        <div className="v3-hero-core">
          <SecurityCoreVisual label="YOUR SITE" />
          <div className="v3-core-caption"><span>LIVE SIGNAL MAP</span><b>7 focused layers</b></div>
        </div>
      </div>
      <div className="v3-trust-rail v3-page">
        {["SAFE URL VALIDATION","HTTP + TLS","SECURITY HEADERS","COOKIE SIGNALS","OWNER CONTEXT","RULE-BASED SCORE"].map((item)=><span key={item}><i />{item}</span>)}
      </div>
      <a className="v3-scroll-cue" href="#story"><span>SCROLL TO TRACE THE SIGNAL</span><i /></a>
    </section>
  );
}

export default HeroScene;
