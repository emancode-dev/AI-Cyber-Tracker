import { useState } from "react";
import RiskBadge from "./RiskBadge";

function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false);
  return <article className={`finding-card finding-${finding.status}`}>
    <div className="finding-header"><div><p className="eyebrow">{finding.category} · {finding.confidence} confidence</p><h3>{finding.title}</h3></div><RiskBadge severity={finding.severity} status={finding.status} /></div>
    <p>{finding.evidenceSummary}</p>
    <button className="text-button" type="button" onClick={() => setExpanded((v) => !v)}>{expanded ? "Hide explanation" : "Why this matters"}</button>
    {expanded ? <p className="finding-why">{finding.whyItMatters}</p> : null}
  </article>;
}
export default FindingCard;
