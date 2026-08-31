import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import SecurityScore from "../components/scan/SecurityScore";
import CategoryScores from "../components/scan/CategoryScores";
import { analyzeScan } from "../services/scanService";

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
        <header className="flow-hero analysis-flow-hero"><p className="eyebrow">RISK ANALYSIS</p><h1>Evidence first. Context second. Score by code.</h1><p className="muted">AI does not choose or change this score.</p></header>
        {loading ? <Loader label="Calculating deterministic score..." /> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}

        {analysis ? <>
          <div className="analysis-score-layout"><SecurityScore score={analysis.score} riskLevel={analysis.riskLevel} /><div className="analysis-score-copy"><span>WHAT THIS MEANS</span><h2>{analysis.riskLevel === "high" ? "Several signals deserve attention first." : analysis.riskLevel === "medium" ? "There’s a useful middle ground: some controls are working, others need focus." : "The current assessment looks stronger, but it is not proof of absolute security."}</h2><p>{analysis.disclaimer}</p></div></div>
          <CategoryScores scores={analysis.categoryScores} />
          <div className="analysis-two-column">
            <section className="analysis-section"><p className="eyebrow">FIX FIRST</p>{analysis.prioritizedFindings.length ? <div className="priority-list">{analysis.prioritizedFindings.map((finding) => <article className="priority-card" key={finding.code}><div><strong>{finding.title}</strong><p className="muted tiny-note">{finding.category} · {finding.severity}</p></div><span>-{finding.penalty}</span></article>)}</div> : <p className="muted">No scanner finding currently contributes a direct penalty.</p>}</section>
            <section className="analysis-section"><p className="eyebrow">OWNER CONTEXT</p>{analysis.contextAdjustments.length ? <div className="priority-list">{analysis.contextAdjustments.map((adjustment) => <article className="priority-card" key={adjustment.code}><div><strong>{adjustment.reason}</strong><p className="muted tiny-note">{adjustment.category}</p></div><span>-{adjustment.penalty}</span></article>)}</div> : <p className="muted">No additional context adjustment was triggered.</p>}</section>
          </div>
          <div className="next-step-card next-step-card-v2"><div><p className="eyebrow">ACTION ROADMAP</p><h3>Turn this evidence into a validated fix plan.</h3><p className="muted">The explanation layer receives only minimized finding codes and required owner context. If AI is unavailable or invalid, a deterministic fallback report is returned.</p></div><Button onClick={() => navigate(`/report/${scanId}`)}>Generate roadmap</Button></div>
        </> : null}
      </section>
    </main>
  );
}

export default AnalysisPage;
