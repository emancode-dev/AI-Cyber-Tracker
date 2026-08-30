function RiskBadge({ severity = "info", status = "observed" }) {
  return <span className={`risk-badge risk-${severity}`}>{status === "manual_review" ? "Needs manual review" : severity.replace("_", " ")}</span>;
}
export default RiskBadge;
