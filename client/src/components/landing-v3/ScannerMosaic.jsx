import { useState } from "react";
import SecurityCoreVisual from "./SecurityCoreVisual";

const headers = {
  CSP: "Controls where scripts, styles and other browser content may load from.",
  HSTS: "Tells supporting browsers to continue using HTTPS after a secure visit.",
  XCTO: "Helps prevent MIME-type guessing for declared content types.",
  REFERRER: "Controls how much referrer information leaves the page.",
  FRAME: "Helps restrict whether other pages may frame the application.",
  PERMISSIONS: "Controls access to selected browser capabilities."
};

function ScannerMosaic() {
  const [selected, setSelected] = useState("HSTS");
  return (
    <section className="v3-mosaic-section">
      <div className="v3-page">
        <div className="v3-editorial-heading" data-reveal><span className="v3-kicker"><span />WHAT WE ACTUALLY CHECK</span><h2>Not “everything.”<br/><em>Only what we can reliably explain.</em></h2><p>One reliable observation is worth more than fifty dramatic guesses.</p></div>
        <div className="v3-mosaic" data-stagger>
          <article className="v3-mosaic-main" data-stagger-item>
            <div className="v3-card-index">01 / SAFE SCANNER</div>
            <div className="v3-mosaic-copy"><h3>One target.<br/>Multiple evidence layers.</h3><p>HTTP behavior, redirects, browser controls, visible cookies, TLS metadata, forms and public metadata — normalized into one finding language.</p><div className="v3-signal-chips">{["HTTP","TLS","CSP","HSTS","COOKIES","FORMS","META"].map(x=><span key={x}>{x}</span>)}</div></div>
            <SecurityCoreVisual compact label="SITE" />
            <div className="v3-card-glow" />
          </article>
          <article className="v3-mosaic-transport" data-stagger-item>
            <div className="v3-card-index">02 / REQUEST PATH</div><h3>Follow the request safely.</h3>
            <div className="v3-request-flow"><span>HTTP</span><i className="v3-flow-dot d1"/><i className="v3-flow-dot d2"/><i className="v3-flow-dot d3"/><b>301</b><span className="active">HTTPS</span><b>200</b></div>
            <p>Every redirect destination is revalidated before the scanner follows it.</p>
          </article>
          <article className="v3-mosaic-headers" data-stagger-item>
            <div className="v3-card-index">03 / SECURITY CONSTELLATION</div><h3>Tap a signal. Learn what it means.</h3>
            <div className="v3-header-map">
              <span className="site-core">SITE</span>
              {Object.keys(headers).map((key,index)=><button type="button" className={`h${index+1} ${selected===key?"active":""}`} onClick={()=>setSelected(key)} key={key}><i/>{key}</button>)}
            </div>
            <div className="v3-header-explainer"><strong>{selected}</strong><span>{headers[selected]}</span></div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default ScannerMosaic;
