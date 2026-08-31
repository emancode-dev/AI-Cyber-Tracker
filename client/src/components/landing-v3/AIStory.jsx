const fields = [
  ["Raw cookies",true],["Email / identity",true],["Raw HTML",true],["Website URL",true],["Credentials",true],["Security score",false],["Finding codes",false],["Required owner context",false]
];
function AIStory(){
  return <section className="v3-ai-story" id="privacy"><div className="v3-page"><div className="v3-conversation-heading" data-reveal><span>“Then what does the AI actually do?”</span><h2>It explains. <em>It doesn’t rewrite the evidence.</em></h2><p>Before any AI call, context is intentionally minimized. The score stays deterministic and the product remains useful if the model is unavailable.</p></div><div className="v3-ai-pipeline">
    <div className="v3-payload-card"><small>RAW ASSESSMENT CONTEXT</small>{fields.map(([name,sensitive])=><div className={`v3-payload-field ${sensitive?"sensitive":"allowed"}`} key={name}><span>{name}</span><i className="v3-payload-cut"/><b>{sensitive?"REMOVE":"KEEP"}</b></div>)}</div>
    <div className="v3-ai-center"><div className="v3-min-payload"><small>MINIMIZED PAYLOAD</small><strong>78</strong><span>HSTS_MISSING</span><span>COOKIE_HTTPONLY_MISSING</span><span>ADMIN_MFA=false</span></div><div className="v3-ai-node"><i/>AI EXPLANATION<i/></div></div>
    <div className="v3-ai-roadmap"><small>REMEDIATION ROADMAP</small><article><b>01</b><span><strong>TODAY</strong>Fix session cookie flags</span></article><article><b>02</b><span><strong>THIS WEEK</strong>Review administrator MFA</span></article><article><b>03</b><span><strong>THIS MONTH</strong>Strengthen security policy</span></article></div>
  </div></div></section>
}
export default AIStory;
