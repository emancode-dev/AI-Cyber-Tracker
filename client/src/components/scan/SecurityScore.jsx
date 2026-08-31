function SecurityScore({ score, riskLevel }) {
  return (
    <section className="security-score" aria-label="Deterministic security score">
      <p className="eyebrow">Deterministic score</p>
      <div className="security-score-value">{score}</div>
      <p className={`analysis-risk analysis-risk-${riskLevel}`}>
        {riskLevel} risk
      </p>
      <p className="muted tiny-note">
        This score summarizes the checks and owner context used by AI Cyber
        Tracker. It is not proof of complete security.
      </p>
    </section>
  );
}

export default SecurityScore;
