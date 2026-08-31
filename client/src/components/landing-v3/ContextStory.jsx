import { useState } from "react";

function ContextStory() {
  const [hasLogin, setHasLogin] = useState(null);
  return (
    <section className="v3-context-section">
      <div className="v3-page">
        <div className="v3-conversation-heading" data-reveal><span>“But a scanner can’t know whether I use MFA.”</span><h2>Exactly. <em>That’s why we ask you.</em></h2><p>A public scanner sees configuration. You know whether the site has login, payments, admin accounts, backups and sensitive data.</p></div>
        <div className="v3-context-merge" data-reveal>
          <div className="v3-context-column technical"><small>SCANNER EVIDENCE</small><strong>HSTS missing</strong><strong>Cookie flag issue</strong><strong>CSP observed</strong><div className="merge-line"><i/><i/><i/></div></div>
          <div className="v3-context-engine"><span>+</span><div><small>CONTEXT</small><b>ENGINE</b></div><span>=</span></div>
          <div className="v3-context-column owner"><small>OWNER CONTEXT</small><strong>Login?</strong><strong>Admin MFA?</strong><strong>Payments?</strong><div className="merge-line reverse"><i/><i/><i/></div></div>
        </div>
        <div className="v3-question-demo" data-reveal>
          <small>TRY THE BRANCHING LOGIC</small>
          {hasLogin === null ? <><h3>Does your website have user accounts?</h3><div><button type="button" onClick={()=>setHasLogin(true)}>Yes</button><button type="button" onClick={()=>setHasLogin(false)}>No</button></div></> : hasLogin ? <><h3>Are administrator accounts protected by MFA?</h3><div><button type="button" onClick={()=>setHasLogin(null)}>Yes</button><button type="button" onClick={()=>setHasLogin(null)}>No / not sure</button></div><p>Because login exists, authentication-specific questions become relevant.</p></> : <><h3>No login? We skip login-specific questions.</h3><button type="button" onClick={()=>setHasLogin(null)}>Try again</button><p>Adaptive questions keep the assessment focused instead of forcing irrelevant forms on everyone.</p></>}
        </div>
      </div>
    </section>
  );
}

export default ContextStory;
