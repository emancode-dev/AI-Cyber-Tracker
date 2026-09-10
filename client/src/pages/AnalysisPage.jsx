import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import SecurityScore from "../components/scan/SecurityScore";
import CategoryScores from "../components/scan/CategoryScores";
import { analyzeScan } from "../services/scanService";

function riskCopy(level) {
  if (level === "high") return "Several externally observed signals deserve attention first.";
  if (level === "medium") return "Some external controls are working while others still need attention.";
  return "The observed external posture is stronger, but this is not proof of absolute security.";
}

function AnalysisPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    analyzeScan(scanId)
      .then(setAnalysis)
      .catch((requestError) => setError(requestError.message || "Could not calculate the score."))
      .finally(() => setLoading(false));
  }, [scanId]);

  return (
    <main className="centered-page analysis-page product-flow-page">
      <section className="dashboard-panel analysis-panel product-flow-panel">
        <div className="flow-topbar"><Button variant="secondary" onClick={() => navigate("/dashboard")}>← Dashboard</Button><span className="flow-status"><i/>Deterministic scoring</span></div>
        <header className="flow-hero analysis-flow-hero"><p className="eyebrow">RISK ANALYSIS</p><h1>Observed posture, owner context, and scope are kept separate.</h1><p className="muted">AI does not choose or change the external posture score.</p></header>
        {loading ? <Loader label="Calculating deterministic score..." /> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {analysis ? <>
          <div className="analysis-score-layout"><SecurityScore score={analysis.externalScore ?? analysis.score} riskLevel={analysis.externalRiskLevel ?? analysis.riskLevel} /><div className="analysis-score-copy"><span>EXTERNAL POSTURE</span><h2>{riskCopy(analysis.externalRiskLevel ?? analysis.riskLevel)}</h2><p>{analysis.disclaimer}</p></div></div>

          <div className="analysis-two-column">
            <section className="analysis-section"><p className="eyebrow">OWNER CONTEXT RISK</p><h2>{String(analysis.contextRiskLevel || "low").toUpperCase()}</h2><p className="muted">Self-reported operating context changes priority, not scanner facts or the external score.</p></section>
            <section className="analysis-section"><p className="eyebrow">OVERALL PRIORITY</p><h2>{String(analysis.overallPriority || analysis.riskLevel).toUpperCase()}</h2><p className="muted">The higher of observed external risk and owner-context risk.</p></section>
          </div>

          {analysis.coverage ? <section className="analysis-section"><p className="eyebrow">ASSESSMENT COVERAGE</p><h2>{analysis.coverage.scopeCoveragePercent}% of this product's declared scope covered</h2><p className="muted">Automated controls: {analysis.coverage.automated.assessed}/{analysis.coverage.automated.total} · Owner context: {analysis.coverage.ownerContext.answered}/{analysis.coverage.ownerContext.total} · Independently observed: {analysis.coverage.independentlyObservedPercent}% of declared scope.</p><p className="muted tiny-note">{analysis.coverage.disclaimer}</p></section> : null}

          <CategoryScores scores={analysis.categoryScores} />
          <div className="analysis-two-column">
            <section className="analysis-section"><p className="eyebrow">FIX FIRST</p>{analysis.prioritizedFindings.length ? <div className="priority-list">{analysis.prioritizedFindings.map((finding) => <article className="priority-card" key={finding.code}><div><strong>{finding.title}</strong><p className="muted tiny-note">{finding.category} · {finding.severity}</p><p className="muted tiny-note">{finding.remediation}</p></div><span>-{finding.penalty}</span></article>)}</div> : <p className="muted">No scanner finding currently contributes a direct penalty.</p>}</section>
            <section className="analysis-section"><p className="eyebrow">OWNER CONTEXT</p>{analysis.contextAdjustments.length ? <div className="priority-list">{analysis.contextAdjustments.map((adjustment) => <article className="priority-card" key={adjustment.code}><div><strong>{adjustment.reason}</strong><p className="muted tiny-note">{adjustment.category}</p></div><span>{adjustment.penalty} risk pts</span></article>)}</div> : <p className="muted">No additional context risk was triggered.</p>}</section>
          </div>

          {analysis.lifecycle ? <section className="analysis-section"><p className="eyebrow">RESCAN CHANGE SET</p><div className="priority-list">{analysis.lifecycle.baseline > 0 ? <article className="priority-card"><div><strong>Baseline</strong><p className="muted tiny-note">First comparable detector baseline, or scanner/rule-pack methodology changed</p></div><span>{analysis.lifecycle.baseline}</span></article> : null}<article className="priority-card"><div><strong>New</strong><p className="muted tiny-note">First observed since the last comparable assessment</p></div><span>{analysis.lifecycle.new}</span></article><article className="priority-card"><div><strong>Resolved</strong><p className="muted tiny-note">Previously open under comparable methodology, now absent</p></div><span>{analysis.lifecycle.resolved}</span></article><article className="priority-card"><div><strong>Regressed</strong><p className="muted tiny-note">Previously resolved under comparable methodology, now returned</p></div><span>{analysis.lifecycle.regressed}</span></article><article className="priority-card"><div><strong>Existing</strong><p className="muted tiny-note">Still present from the last comparable assessment</p></div><span>{analysis.lifecycle.existing}</span></article></div></section> : null}

          <div className="next-step-card next-step-card-v2"><div><p className="eyebrow">ACTION ROADMAP</p><h3>Turn this evidence into a grounded fix plan.</h3><p className="muted">The AI layer receives minimized finding facts and selected owner context. It cannot change the deterministic score and falls back to code-generated remediation if the provider fails.</p></div><Button onClick={() => navigate(`/report/${scanId}`)}>Generate roadmap</Button></div>
        </> : null}
      </section>
    </main>
  );
}

export default AnalysisPage;
