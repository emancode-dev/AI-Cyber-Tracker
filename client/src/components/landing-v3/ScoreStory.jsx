const cats = [["Transport",92],["Headers",67],["Cookies",58],["Application",73],["Operations",61]];
function ScoreStory() {
  return (
    <section className="v3-score">
      <div className="v3-page v3-score-layout">
        <div className="v3-score-copy" data-reveal><span className="v3-kicker"><span />DETERMINISTIC RISK</span><h2>“Does AI decide whether I’m secure?”</h2><strong>No. And we don’t think it should.</strong><p>The same verified findings and the same owner answers go through the same documented JavaScript rules and return the same score.</p></div>
        <div className="v3-score-machine" data-reveal>
          <div className="v3-score-inputs"><span className="v3-score-input"><i>−08</i><b>HSTS missing</b></span><span className="v3-score-input"><i>−06</i><b>Cookie session risk</b></span><span className="v3-score-input"><i>−09</i><b>Admin MFA context</b></span><span className="v3-score-input good"><i>+12</i><b>Passed controls</b></span></div>
          <div className="v3-rule-engine"><small>PURE JS RULE ENGINE</small><strong>EVIDENCE + CONTEXT</strong><span>reproducible · testable · no model guessing</span></div>
          <div className="v3-score-gauge"><div><small>SECURITY SCORE</small><strong>78</strong><span>MEDIUM RISK</span></div></div>
          <div className="v3-score-categories">{cats.map(([name,value])=><div key={name}><span>{name}</span><i><b className="v3-category-fill" style={{width:`${value}%`}}/></i><strong>{value}</strong></div>)}</div>
        </div>
      </div>
    </section>
  );
}
export default ScoreStory;
