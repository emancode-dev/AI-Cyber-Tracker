function SecurityGauge({ score = null, label = "Security score", compact = false }) {
  const safeScore = typeof score === "number" ? Math.max(0, Math.min(100, score)) : 0;
  const risk = score == null ? "No scan" : safeScore >= 80 ? "Low risk" : safeScore >= 60 ? "Medium risk" : "High risk";

  return (
    <div className={`dashboard-gauge ${compact ? "dashboard-gauge-compact" : ""}`.trim()} style={{ "--score": safeScore }}>
      <div className="dashboard-gauge-inner">
        <small>{label}</small>
        <strong>{score == null ? "—" : safeScore}</strong>
        <span>{risk}</span>
      </div>
    </div>
  );
}

export default SecurityGauge;
