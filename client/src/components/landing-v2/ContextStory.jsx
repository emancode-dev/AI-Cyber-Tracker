import { useState } from "react";
import Reveal from "./Reveal";

function ContextStory() {
  const [hasLogin, setHasLogin] = useState(null);
  const [mfa, setMfa] = useState(null);

  return (
    <section className="story-section context-section">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center">
          <span className="cyber-kicker"><span/>THE SCANNER CAN'T KNOW EVERYTHING</span>
          <h2>“But a scanner can’t know whether I use MFA.”</h2>
          <p className="conversation-answer">Exactly. That’s why we ask you.</p>
        </Reveal>

        <div className="context-flow">
          <Reveal className="context-source"><small>SCANNER EVIDENCE</small><strong>3 technical findings</strong><span>Things visible from outside.</span></Reveal>
          <div className="context-merge"><i/><span>RISK<br/>CONTEXT</span><i/></div>
          <Reveal className="context-source" delay={130}><small>OWNER CONTEXT</small><strong>Adaptive answers</strong><span>Things only you can confirm.</span></Reveal>
        </div>

        <Reveal className="question-demo" delay={100}>
          {hasLogin === null ? (
            <><span className="question-demo-step">DEMO QUESTION 01</span><h3>Does your website have user accounts?</h3><div><button type="button" onClick={() => setHasLogin(true)}>Yes</button><button type="button" onClick={() => setHasLogin(false)}>No</button></div></>
          ) : hasLogin && mfa === null ? (
            <><span className="question-demo-step">FOLLOW-UP UNLOCKED</span><h3>Are administrator accounts protected by MFA?</h3><div><button type="button" onClick={() => setMfa(true)}>Yes</button><button type="button" onClick={() => setMfa(false)}>No</button><button type="button" onClick={() => setMfa("unknown")}>Not sure</button></div></>
          ) : (
            <><span className="question-demo-step">CONTEXT CAPTURED</span><h3>{hasLogin ? "See the difference? The next question only appeared because login exists." : "No login? Login-specific questions stay out of the way."}</h3><button type="button" className="question-reset" onClick={() => {setHasLogin(null);setMfa(null);}}>Try again</button></>
          )}
        </Reveal>
      </div>
    </section>
  );
}

export default ContextStory;
