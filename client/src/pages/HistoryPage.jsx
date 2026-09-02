import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ChartLineUp, ClockCounterClockwise } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { getWebsiteFindingHistory, getWebsiteHistory, getWebsites } from "../services/websiteService";


function methodologyKey(item) {
  if (!item) return null;
  return [item.scanner_version, item.rule_pack_version, item.risk_engine_version, item.questionnaire_version]
    .map((value) => value || "unknown")
    .join("|");
}

function HistoryPage() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [selected, setSelected] = useState("");
  const [history, setHistory] = useState([]);
  const [findingHistory, setFindingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { getWebsites().then((items) => { setWebsites(items); setSelected(items[0]?.id || ""); }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => {
    if (!selected) return undefined;
    let active = true;
    setLoading(true);
    Promise.all([getWebsiteHistory(selected), getWebsiteFindingHistory(selected)])
      .then(([scoreItems, findingItems]) => { if (active) { setHistory(scoreItems); setFindingHistory(findingItems); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selected]);

  function selectWebsite(event) { setError(""); setSelected(event.target.value); }
  const previous = history.at(-2);
  const latest = history.at(-1);
  const methodologyComparable = Boolean(previous && latest && methodologyKey(previous) === methodologyKey(latest));
  const categories = latest ? Object.entries(latest.category_scores || {}).map(([name, score]) => {
    const before = previous?.category_scores?.[name];
    const delta = methodologyComparable && typeof before === "number" ? score - before : null;
    return { name, score, delta };
  }) : [];

  return <section className="em-subpage"><header><span className="em-section-label">HISTORY</span><h1>Score movement and finding lifecycle without retained raw evidence</h1><p>Detailed scan evidence expires, while minimal score and baseline/new/existing/resolved/regressed lifecycle events remain.</p></header><div className="em-history-toolbar"><label htmlFor="history-site">Website</label><select id="history-site" className="field-input" value={selected} onChange={selectWebsite}>{websites.map((site) => <option value={site.id} key={site.id}>{site.name}</option>)}</select><Button disabled={!selected} onClick={() => navigate(`/scan/${selected}`)}>Run a fresh rescan <ArrowRight /></Button></div>{loading ? <Loader label="Loading assessment history..."/> : null}{error ? <p className="alert alert-error">{error}</p> : null}{latest && previous ? <section className="em-comparison"><header><div><small>BEFORE / AFTER</small><h2>Latest external-posture movement</h2></div><strong>{previous.score} <ArrowRight /> {latest.score}</strong></header>{!methodologyComparable ? <p className="alert alert-warning">Methodology changed between these assessments. Scores are shown, but improvement/regression deltas are intentionally not claimed.</p> : null}<div>{categories.map((item) => <article key={item.name} className={item.delta > 0 ? "improved" : item.delta < 0 ? "regressed" : "steady"}><span>{item.delta > 0 ? <ArrowUp /> : item.delta < 0 ? <ArrowDown /> : <ArrowRight />}</span><div><b>{item.name.replaceAll("_", " ")}</b><small>{!methodologyComparable ? "Methodology changed" : item.delta > 0 ? "Improved" : item.delta < 0 ? "Needs attention" : "Unchanged"}</small></div><strong>{item.delta === null ? (methodologyComparable ? "New" : "N/A") : `${item.delta > 0 ? "+" : ""}${item.delta}`}</strong></article>)}</div></section> : null}<section className="analysis-section"><p className="eyebrow">FINDING LIFECYCLE</p><div className="priority-list">{findingHistory.slice(0, 20).map((item) => <article className="priority-card" key={item.id}><div><strong>{item.title}</strong><p className="muted tiny-note">{item.finding_code} · {item.category} · {new Date(item.created_at).toLocaleString()}</p></div><span>{item.lifecycle_state}</span></article>)}{!loading && !findingHistory.length ? <p>No retained finding lifecycle events yet.</p> : null}</div></section><div className="em-history-list">{history.map((item, index) => <article key={item.id}><span><ClockCounterClockwise /></span><div><strong>Assessment {String(index + 1).padStart(2, "0")}</strong><small>{new Date(item.created_at).toLocaleString()} · external {item.risk_level} · context {item.context_risk_level || "n/a"} · priority {item.overall_priority || item.risk_level}</small></div><b>{item.score}</b><ChartLineUp /></article>)}{!loading && !history.length ? <p>No saved score history yet. Complete an analysis to create one.</p> : null}</div></section>;
}

export default HistoryPage;
