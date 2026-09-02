import { useState } from "react";
import RiskBadge from "./RiskBadge";

function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(false);
  const standards = [
    ...(finding.standards?.owaspTop10 || []),
    ...(finding.standards?.asvs || []),
    ...(finding.standards?.wstg || [])
  ];
  return <article className={`finding-card finding-${finding.status}`}>
    <div className="finding-header"><div><p className="eyebrow">{finding.category} · {finding.confidence} confidence · {finding.observationStatus || "observed"}</p><h3>{finding.title}</h3></div><RiskBadge severity={finding.severity} status={finding.status} /></div>
    <p>{finding.evidenceSummary}</p>
    <button className="text-button" type="button" onClick={() => setExpanded((v) => !v)}>{expanded ? "Hide details" : "Why this matters + how to fix"}</button>
    {expanded ? <div className="finding-why"><p><strong>Why this matters:</strong> {finding.whyItMatters}</p><p><strong>Recommended action:</strong> {finding.remediation}</p><p><strong>How to verify:</strong> {finding.verification}</p>{standards.length ? <p><strong>Related guidance:</strong> {standards.join(" · ")}</p> : null}<p><strong>Rule version:</strong> {finding.ruleVersion || "legacy"} · <strong>Source:</strong> {finding.source || "passive scanner"}</p></div> : null}
  </article>;
}
export default FindingCard;
