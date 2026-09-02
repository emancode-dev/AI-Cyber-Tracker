import { useEffect, useState } from "react";
import { ArrowRight, FileText, ShieldCheck } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { getWebsites } from "../services/websiteService";

function ReportsPage() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getWebsites().then(setWebsites).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  return <section className="em-subpage"><header><span className="em-section-label">REPORTS</span><h1>Evidence-backed roadmaps</h1><p>Generate or reopen a roadmap from each website’s latest completed assessment.</p></header>{loading ? <Loader label="Loading reports..." /> : null}{error ? <p className="alert alert-error">{error}</p> : null}<div className="em-report-cards">{websites.map((site) => <button type="button" key={site.id} disabled={!site.latest_scan_id} onClick={() => navigate(`/report/${site.latest_scan_id}`)}><FileText weight="duotone"/><div><strong>{site.name}</strong><small>{site.latest_scan_id ? `Latest score ${site.score}` : typeof site.score === "number" ? `Retained score ${site.score} · detailed report expired` : "Complete an assessment first"}</small></div>{site.latest_scan_id ? <ArrowRight /> : <ShieldCheck />}</button>)}</div></section>;
}

export default ReportsPage;
