import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import FindingCard from "../components/scan/FindingCard";
import ScanProgress from "../components/scan/ScanProgress";
import { getWebsite } from "../services/websiteService";
import { startWebsiteScan } from "../services/scanService";

const steps = [
  "Validate target URL",
  "Inspect HTTP and redirects",
  "Review headers, cookies and TLS",
  "Check public metadata",
  "Normalize and save findings"
];

function ScanPage() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [loadingWebsite, setLoadingWebsite] = useState(true);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    getWebsite(websiteId)
      .then(setWebsite)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoadingWebsite(false));
  }, [websiteId]);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, 850);
    return () => clearInterval(timer);
  }, [running]);

  const findings = useMemo(() => scanResult?.findings || [], [scanResult]);
  const categories = useMemo(() => ["all", ...new Set(findings.map((finding) => finding.category))], [findings]);
  const visible = category === "all" ? findings : findings.filter((finding) => finding.category === category);

  async function handleStartScan() {
    if (!authorizationConfirmed) return;
    try {
      setError("");
      setScanResult(null);
      setCategory("all");
      setActiveStep(0);
      setRunning(true);
      const result = await startWebsiteScan(websiteId);
      setScanResult(result);
      setActiveStep(steps.length);
    } catch (requestError) {
      setError(requestError.message || "The scan could not be completed.");
      setActiveStep(-1);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="centered-page scan-page product-flow-page">
      <section className="dashboard-panel scan-panel product-flow-panel">
        <div className="flow-topbar">
          <Button variant="secondary" onClick={() => navigate("/dashboard")}>← Dashboard</Button>
          <span className="flow-status"><i/>Protected assessment</span>
        </div>

        {loadingWebsite ? <Loader label="Loading website..." /> : error && !website ? <p className="alert alert-error">{error}</p> : (
          <>
            <header className="flow-hero">
              <p className="eyebrow">PASSIVE SECURITY ASSESSMENT</p>
              <h1>Let’s inspect what the outside world can actually see.</h1>
              <p className="muted break-word">{website?.name} · {website?.url}</p>
            </header>

            <div className="authorization-box authorization-box-v2">
              <div className="authorization-icon">✓</div>
              <label className="checkbox-row">
                <input type="checkbox" checked={authorizationConfirmed} onChange={(event) => setAuthorizationConfirmed(event.target.checked)} disabled={running} />
                <span><strong>Confirm authorization</strong>I own this website or have explicit permission to perform this passive assessment.</span>
              </label>
              <p className="tiny-note muted">No brute force, credential attempts, destructive payloads or intentional private-network access.</p>
            </div>

            <div className="scan-progress-wrap-v2"><ScanProgress steps={steps} activeIndex={activeStep} /></div>

            {error ? <p className="alert alert-error" role="alert">{error}</p> : null}

            <Button className="scan-start-button-v2" onClick={handleStartScan} disabled={!authorizationConfirmed || running}>
              {running ? <Loader label="Running passive assessment..." compact /> : "Start authorized scan"}
            </Button>

            {scanResult ? (
              <>
                <div className="scan-result-summary result-summary-v2">
                  <div><p className="eyebrow">ASSESSMENT COMPLETE</p><h2>Here’s what the target actually returned.</h2></div>
                  <div className="scan-target-meta"><span>HTTP <b>{scanResult.target.statusCode}</b></span><span>Redirects <b>{scanResult.target.redirectCount}</b></span><span>Findings <b>{findings.length}</b></span></div>
                </div>

                <div className="filter-row filter-row-v2">{categories.map((item) => <Button key={item} variant={category === item ? "primary" : "secondary"} onClick={() => setCategory(item)}>{item}</Button>)}</div>
                <div className="finding-list finding-list-v2">{visible.map((finding) => <FindingCard key={finding.code} finding={finding} />)}</div>

                <div className="next-step-card next-step-card-v2">
                  <div><p className="eyebrow">NEXT: OWNER CONTEXT</p><h3>The scanner can’t see everything that changes risk.</h3><p className="muted">Backups, admin MFA, payment handling and retention practices need your context.</p></div>
                  <Button onClick={() => navigate(`/questionnaire/${scanResult.scan.id}`)}>Continue to questions →</Button>
                </div>
              </>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}

export default ScanPage;
