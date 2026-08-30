export function getRiskLabel(score) {
  if (score === null || score === undefined) {
    return { key: "unscanned", label: "Not scanned", tone: "neutral" };
  }
  if (score >= 80) return { key: "low", label: "Low risk", tone: "good" };
  if (score >= 60) return { key: "medium", label: "Medium risk", tone: "warn" };
  return { key: "high", label: "High risk", tone: "danger" };
}
