import Reveal from "./Reveal";

const removed = ["website URL", "email", "raw cookies", "raw HTML", "credentials"];

function AIStory() {
  return (
    <section className="story-section ai-story-section">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center">
          <span className="cyber-kicker"><span/>SO WHY USE AI?</span>
          <h2>To explain. Not to invent.</h2>
          <p>Before evidence reaches the AI layer, unnecessary context is stripped away.</p>
        </Reveal>
        <div className="ai-pipeline">
          <Reveal className="payload-card">
            <small>FULL APPLICATION CONTEXT</small>
            {removed.map((item) => <span className="payload-removed" key={item}>{item}<b>REMOVED</b></span>)}
            <span>finding codes<b className="keep">KEEP</b></span><span>risk score<b className="keep">KEEP</b></span><span>required answers<b className="keep">KEEP</b></span>
          </Reveal>
          <div className="pipeline-arrow"><i/><span>MINIMIZE</span></div>
          <Reveal className="ai-core-card" delay={100}><span>AI</span><strong>Evidence-bound explanation</strong><small>Score cannot be changed here.</small></Reveal>
          <div className="pipeline-arrow"><i/><span>RETURN</span></div>
          <Reveal className="roadmap-stack" delay={180}>{[['TODAY','Fix cookie flags'],['THIS WEEK','Review administrator MFA'],['THIS MONTH','Strengthen policy coverage']].map(([when,task]) => <article key={when}><small>{when}</small><strong>{task}</strong></article>)}</Reveal>
        </div>
      </div>
    </section>
  );
}

export default AIStory;
