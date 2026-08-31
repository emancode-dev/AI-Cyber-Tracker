import { useState } from "react";
import Reveal from "./Reveal";
import SecurityOrb from "./SecurityOrb";

const headerNotes = {
  CSP: "Restricts where browser content can come from.",
  HSTS: "Tells supporting browsers to keep using HTTPS.",
  XCTO: "Reduces MIME-type sniffing behavior.",
  REFERRER: "Controls how much referrer information is sent.",
  FRAME: "Helps limit framing and clickjacking exposure.",
  PERMISSIONS: "Controls access to selected browser features."
};

function ScannerMosaic() {
  const [selectedHeader, setSelectedHeader] = useState("HSTS");
  return (
    <section className="story-section scanner-mosaic-section">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center"><span className="cyber-kicker"><span/>WHAT WE ACTUALLY CHECK</span><h2>Not “everything.”<br/>Only what we can reliably explain.</h2><p>Focused, passive observations become structured findings instead of a giant list of noisy claims.</p></Reveal>
        <div className="mosaic-grid">
          <Reveal className="mosaic-card mosaic-card-main"><div className="mosaic-card-copy"><span>01 / SAFE SCANNER</span><h3>One target. Multiple reliable signals.</h3><p>HTTP behavior, redirects, browser security headers, visible cookies, practical TLS metadata, forms and public metadata.</p></div><SecurityOrb compact label="TARGET" /></Reveal>
          <Reveal className="mosaic-card transport-card" delay={100}><div className="mosaic-card-copy"><span>02 / TRANSPORT</span><h3>Follow the request safely.</h3></div><div className="http-path"><b>HTTP</b><i>→</i><b>301</b><i>→</i><b className="is-active">HTTPS</b><i>→</i><b>200</b></div><p className="tiny-caption">Redirect destinations are revalidated before the scanner follows them.</p></Reveal>
          <Reveal className="mosaic-card constellation-card" delay={170}><div className="mosaic-card-copy"><span>03 / BROWSER CONTROLS</span><h3>Tap a signal to understand it.</h3></div><div className="header-constellation" aria-label="Header signal constellation">{Object.keys(headerNotes).map((item,index) => <button key={item} type="button" className={`header-node header-node-${index+1} ${selectedHeader === item ? "active" : ""}`.trim()} onClick={() => setSelectedHeader(item)}><i/>{item}</button>)}<span className="constellation-core">SITE</span></div><div className="constellation-note"><strong>{selectedHeader}</strong><span>{headerNotes[selectedHeader]}</span></div></Reveal>
        </div>
      </div>
    </section>
  );
}

export default ScannerMosaic;
