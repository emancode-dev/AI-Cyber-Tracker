import { useEffect, useState } from "react";
import { ArrowLeft, Brain, CalendarCheck, CheckCircle, DownloadSimple, ShieldCheck, Trash, Warning } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { deleteAssessmentData, generateReport } from "../services/scanService";

const tabs = [["today", "Today"], ["thisWeek", "This week"], ["thisMonth", "This month"]];

function ReportPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    generateReport(scanId).then(setReport).catch((requestError) => setError(requestError.message || "Could not generate the roadmap.")).finally(() => setLoading(false));
  }, [scanId]);

  async function handleDelete() {
    if (!window.confirm("Delete this report, questionnaire answers, findings and scan details now? The lightweight score history is retained.")) return;
    try {
      setDeleting(true);
      await deleteAssessmentData(scanId);
      toast.success("Detailed assessment data deleted. Score history was retained.");
      navigate("/dashboard/history", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Could not delete assessment data.");
      setDeleting(false);
    }
  }

  function exportReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cyber-tracker-report-${scanId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported locally.");
  }

  return (
    <main className="em-report-page">
      <section className="em-report-shell">
        <header className="em-report-topbar"><Button variant="secondary" onClick={() => navigate("/dashboard")}><ArrowLeft /> Dashboard</Button><span><ShieldCheck weight="fill" /> Evidence-locked report</span></header>
        {loading ? <Loader label="Generating a validated remediation roadmap..." /> : null}
        {error ? <p className="alert alert-error">{error}</p> : null}
        {report ? <>
          <section className="em-report-hero"><div><span className="em-section-label">ASSESSMENT REPORT</span><h1>Priorities that stay tied to verified evidence.</h1><p>{report.summary}</p><div className="em-report-meta"><span><Brain /> {report.mode === "ai" ? "Validated AI explanation" : "Deterministic fallback"}</span><span><CalendarCheck /> Expires {new Date(report.expiresAt).toLocaleString()}</span></div></div><aside><small>REPORT SOURCE</small><strong>{report.mode === "ai" ? "AI + code" : "Code only"}</strong><span>{report.modelUsed}</span></aside></section>
          <section className="em-report-grid">
            <article className="em-report-panel"><header><div><small>FIX FIRST</small><h2>Priority findings</h2></div><Warning weight="duotone" /></header><div className="em-report-list">{report.priorities.length ? report.priorities.map((item, index) => <article key={`${item.findingCode}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{item.findingCode.replaceAll("_", " ")}</strong><p>{item.explanation}</p></div></article>) : <p>No penalized findings require immediate action.</p>}</div></article>
            <article className="em-report-panel"><header><div><small>ROADMAP</small><h2>Remediation plan</h2></div><CheckCircle weight="duotone" /></header><div className="em-roadmap-tabs" role="tablist">{tabs.map(([key, label]) => <button className={activeTab === key ? "active" : ""} type="button" role="tab" aria-selected={activeTab === key} onClick={() => setActiveTab(key)} key={key}>{label}</button>)}</div><ol className="em-roadmap-steps">{report.roadmap[activeTab]?.length ? report.roadmap[activeTab].map((step, index) => <li key={`${step.sourceType || "legacy"}-${step.sourceCode || index}-${index}`}><span>{index + 1}</span><p>{step.action || String(step)}{step.sourceCode ? <small className="em-roadmap-source">Source: {step.sourceCode.replaceAll("_", " ")}</small> : null}</p></li>) : <li><span>✓</span><p>No action assigned to this time window.</p></li>}</ol></article>
          </section>
          <section className="em-report-panel em-manual-panel"><header><div><small>HUMAN CHECK</small><h2>Manual review boundary</h2></div><ShieldCheck weight="duotone" /></header><div className="em-manual-grid">{report.manualReview.map((item) => <article key={item.findingCode}><strong>{item.findingCode.replaceAll("_", " ")}</strong><p>{item.reason}</p></article>)}</div></section>
          <section className="em-report-actions"><Button variant="secondary" onClick={exportReport}><DownloadSimple /> Export before expiry</Button></section>
          <section className="em-delete-panel"><div><Trash weight="duotone" /><span><strong>Delete detailed assessment data now</strong><small>Removes this scan, answers, findings and report. Lightweight score history remains.</small></span></div><Button variant="danger" disabled={deleting} onClick={handleDelete}>{deleting ? "Deleting..." : "Delete now"}</Button></section>
        </> : null}
      </section>
    </main>
  );
}

export default ReportPage;
