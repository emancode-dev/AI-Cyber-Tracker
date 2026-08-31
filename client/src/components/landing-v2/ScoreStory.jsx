import Reveal from "./Reveal";

function ScoreStory() {
  return (
    <section className="story-section score-story-section">
      <div className="page-width score-story-grid">
        <Reveal className="score-story-copy">
          <span className="cyber-kicker"><span/>DETERMINISTIC RISK</span>
          <h2>“Wait — does AI decide whether I’m secure?”</h2>
          <p className="conversation-answer">No. And we don’t think it should.</p>
          <p>Verified findings and owner context pass through documented JavaScript rules. Same input. Same score.</p>
          <div className="score-inputs"><span>Verified findings <b>04</b></span><span>Owner context <b>02</b></span><span>Passed controls <b>11</b></span></div>
        </Reveal>
        <Reveal className="score-machine" delay={120}>
          <div className="score-ring"><div><strong>78</strong><span>MEDIUM RISK</span></div></div>
          <div className="score-rule-engine"><small>RULE ENGINE</small><span>findings + context → deterministic score</span></div>
          <div className="category-bars">
            {[['Transport',92],['Headers',67],['Cookies',58],['Application',73],['Operations',61]].map(([name,value]) => <div key={name}><span>{name}</span><i><b style={{width:`${value}%`}}/></i><strong>{value}</strong></div>)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default ScoreStory;
