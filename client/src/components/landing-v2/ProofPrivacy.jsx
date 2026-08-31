import { useState } from "react";
import Reveal from "./Reveal";
import { marketingStats } from "../../data/visualDemoData";

function ProofPrivacy() {
  const [after, setAfter] = useState(false);
  return (
    <>
      <section className="story-section proof-section">
        <div className="page-width">
          <Reveal className="stats-row">{marketingStats.map((stat)=><article key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span><small>{stat.note}</small></article>)}</Reveal>
          <Reveal className="before-after-card" delay={120}>
            <div className="before-after-copy"><span className="cyber-kicker"><span/>WHY THIS BECOMES USEFUL</span><h2>Security gets easier when progress becomes visible.</h2><p>Use the comparison to see how resolving a few concrete findings changes the picture.</p><div className="comparison-toggle"><button type="button" className={!after?"active":""} onClick={()=>setAfter(false)}>Before</button><button type="button" className={after?"active":""} onClick={()=>setAfter(true)}>After fixes</button></div></div>
            <div className={`comparison-score ${after?"after":""}`}><strong>{after?84:61}</strong><span>{after?"LOWER RISK":"MEDIUM / HIGH"}</span><ul>{after?<><li>✓ HSTS fixed</li><li>✓ CSP configured</li><li>✓ HttpOnly added</li><li>⚠ Admin MFA review remains</li></>:<><li>× HSTS missing</li><li>× CSP missing</li><li>× HttpOnly missing</li><li>× Admin MFA disabled</li></>}</ul></div>
          </Reveal>
        </div>
      </section>

      <section className="story-section privacy-section" id="privacy">
        <div className="page-width privacy-grid">
          <Reveal className="story-heading"><span className="cyber-kicker"><span/>PRIVACY BY DESIGN</span><h2>“What happens to my security data?”</h2><p className="conversation-answer">It shouldn’t become another security risk.</p><p>Detailed assessment data is designed around a short retention window, ownership checks and minimized AI context.</p></Reveal>
          <Reveal className="retention-visual" delay={120}><div className="retention-packet"><i/><strong>DETAILED<br/>ASSESSMENT DATA</strong></div><div className="retention-line"><span>0h</span><i/><span>24h</span><i/><span>48h</span></div><div className="retention-result">Detailed data → scheduled for deletion</div></Reveal>
        </div>
        <div className="page-width privacy-cards">{['48h detailed retention','Delete-now control','RLS-protected data','Ownership checks','Minimal AI context','No raw credential collection'].map((item,index)=><Reveal className="privacy-card" delay={index*45} key={item}><i>0{index+1}</i><strong>{item}</strong></Reveal>)}</div>
      </section>
    </>
  );
}

export default ProofPrivacy;
