import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ChartLineUp, ClockCounterClockwise } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { getWebsiteHistory, getWebsites } from "../services/websiteService";

function HistoryPage() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getWebsites().then((items) => { setWebsites(items); setSelected(items[0]?.id || ""); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!selected) return undefined; let active = true; getWebsiteHistory(selected).then((items) => { if (active) setHistory(items); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [selected]);
  function selectWebsite(event) { setLoading(true); setError(""); setSelected(event.target.value); }
  const previous = history.at(-2);
  const latest = history.at(-1);
  const categories = latest ? Object.entries(latest.category_scores || {}).map(([name, score]) => {
    const before = previous?.category_scores?.[name];
    const delta = typeof before === "number" ? score - before : null;
    return { name, score, delta };
  }) : [];
  return <section className="em-subpage"><header><span className="em-section-label">HISTORY</span><h1>Score movement without retained secrets</h1><p>Only lightweight score and category history survives detailed assessment cleanup.</p></header><div className="em-history-toolbar"><label htmlFor="history-site">Website</label><select id="history-site" className="field-input" value={selected} onChange={selectWebsite}>{websites.map((site) => <option value={site.id} key={site.id}>{site.name}</option>)}</select><Button disabled={!selected} onClick={() => navigate(`/scan/${selected}`)}>Run a fresh rescan <ArrowRight /></Button></div>{loading ? <Loader label="Loading score history..."/> : null}{error ? <p className="alert alert-error">{error}</p> : null}{latest && previous ? <section className="em-comparison"><header><div><small>BEFORE / AFTER</small><h2>Latest movement</h2></div><strong>{previous.score} <ArrowRight /> {latest.score}</strong></header><div>{categories.map((item) => <article key={item.name} className={item.delta > 0 ? "improved" : item.delta < 0 ? "regressed" : "steady"}><span>{item.delta > 0 ? <ArrowUp /> : item.delta < 0 ? <ArrowDown /> : <ArrowRight />}</span><div><b>{item.name.replaceAll("_", " ")}</b><small>{item.delta > 0 ? "Improved" : item.delta < 0 ? "Needs attention" : "Unchanged"}</small></div><strong>{item.delta === null ? "New" : `${item.delta > 0 ? "+" : ""}${item.delta}`}</strong></article>)}</div></section> : null}<div className="em-history-list">{history.map((item, index) => <article key={item.id}><span><ClockCounterClockwise /></span><div><strong>Assessment {String(index + 1).padStart(2, "0")}</strong><small>{new Date(item.created_at).toLocaleString()} · {item.risk_level} risk</small></div><b>{item.score}</b><ChartLineUp /></article>)}{!loading && !history.length ? <p>No saved score history yet. Generate a report after an assessment.</p> : null}</div></section>;
}

export default HistoryPage;
