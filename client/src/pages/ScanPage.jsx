import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import FindingCard from "../components/scan/FindingCard";
import ScanProgress from "../components/scan/ScanProgress";
import { getWebsite } from "../services/websiteService";
import { mockFindings } from "../data/mockFindings";

const steps = ["Validate target URL", "Inspect HTTP and redirects", "Review headers and cookies", "Normalize findings"];
function ScanPage() {
  const { websiteId } = useParams(); const navigate = useNavigate(); const [website, setWebsite] = useState(null); const [loadingWebsite, setLoadingWebsite] = useState(true); const [error, setError] = useState(""); const [running, setRunning] = useState(false); const [activeStep, setActiveStep] = useState(-1); const [showFindings, setShowFindings] = useState(false); const [category, setCategory] = useState("all");
  useEffect(() => { getWebsite(websiteId).then(setWebsite).catch((e) => setError(e.message)).finally(() => setLoadingWebsite(false)); }, [websiteId]);
  useEffect(() => { if (!running) return undefined; if (activeStep >= steps.length) { setRunning(false); setShowFindings(true); return undefined; } const timer = setTimeout(() => setActiveStep((i) => i + 1), 450); return () => clearTimeout(timer); }, [running, activeStep]);
  const categories = useMemo(() => ["all", ...new Set(mockFindings.map((f) => f.category))], []);
  const visible = category === "all" ? mockFindings : mockFindings.filter((f) => f.category === category);
  function startPreview() { setShowFindings(false); setActiveStep(0); setRunning(true); }
  return <main className="centered-page scan-page"><section className="dashboard-panel scan-panel"><Button variant="secondary" onClick={() => navigate("/dashboard")}>← Back</Button>{loadingWebsite ? <Loader label="Loading website..."/> : error ? <p className="alert alert-error">{error}</p> : <><div><p className="eyebrow">Days 16–20 scanner UI</p><h1>Safe scanner preview</h1><p className="muted">{website?.name} · {website?.url}</p><p>The backend contains real safe scanner modules, but the public scan endpoint/persistence is deliberately held until Day 21. This page therefore uses standardized preview findings.</p></div><ScanProgress steps={steps} activeIndex={activeStep}/><Button onClick={startPreview} disabled={running}>{running ? <Loader label="Preview running..." compact/> : "Run UI preview"}</Button>{showFindings ? <><div className="filter-row">{categories.map((item) => <Button key={item} variant={category === item ? "primary" : "secondary"} onClick={() => setCategory(item)}>{item}</Button>)}</div><div className="finding-list">{visible.map((finding) => <FindingCard key={finding.code} finding={finding}/>)}</div></> : null}</>}</section></main>;
}
export default ScanPage;
