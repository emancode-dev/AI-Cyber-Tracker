import { useMemo, useState } from "react";
import {
  ArrowRight, ChartLineUp, CheckCircle, GlobeHemisphereWest,
  ShieldCheck, Siren, Target, TrendUp
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import Button from "../Button";
import Input from "../Input";
import Loader from "../Loader";
import WebsiteList from "../WebsiteList";
import WebsiteTable from "../WebsiteTable";
import EditWebsiteModal from "../EditWebsiteModal";
import MetricCard from "./MetricCard";
import SecurityGauge from "./SecurityGauge";
import CategoryExposurePanel from "./CategoryExposurePanel";
import { getRiskLabel } from "../../utils/risk";

const DEMO_TREND = [58, 61, 65, 63, 70, 68, 74, 78, 76, 81, 84];
const CHART_COLORS = { low: "#55f5b3", medium: "#f1c56c", high: "#ff817f", unscanned: "#567064" };

function scoreOf(website) {
  return typeof website.score === "number" ? website.score : null;
}

function DashboardOverview({ websites = [], summaryData = null, loading = false, error = "", onRetry, onDelete, onScan, onUpdate, demo = false }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [editingWebsite, setEditingWebsite] = useState(null);

  const summary = useMemo(() => {
    const scored = websites.filter((website) => scoreOf(website) !== null);
    const average = scored.length ? Math.round(scored.reduce((total, website) => total + website.score, 0) / scored.length) : null;
    return {
      average,
      high: scored.filter((website) => website.score < 60).length,
      medium: scored.filter((website) => website.score >= 60 && website.score < 80).length,
      low: scored.filter((website) => website.score >= 80).length,
      scanned: scored.length,
      total: websites.length
    };
  }, [websites]);

  const normalized = searchTerm.trim().toLowerCase();
  const filteredWebsites = websites.filter((website) => {
    const matchesSearch = !normalized || website.name.toLowerCase().includes(normalized) || website.url.toLowerCase().includes(normalized);
    const risk = getRiskLabel(website.score);
    return matchesSearch && (riskFilter === "all" || risk.key === riskFilter);
  });

  const scoredWebsites = websites.filter((website) => scoreOf(website) !== null);
  const trendValues = demo ? DEMO_TREND : (summaryData?.trend || []).map((point) => point.score);
  const trendData = demo
    ? DEMO_TREND.map((score, index) => ({ label: `P${index + 1}`, score }))
    : (summaryData?.trend || []).map((point) => ({ label: new Date(point.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }), score: point.score, website: point.websiteName }));
  const profileData = demo
    ? scoredWebsites.slice(0, 7).map((website) => ({ name: website.name.split(" ")[0], score: website.score, risk: getRiskLabel(website.score).key }))
    : (summaryData?.comparison || []).slice(0, 7).map((website) => ({ name: website.name.split(" ")[0], score: website.score, risk: website.riskLevel }));
  const priority = demo ? [...scoredWebsites].sort((a, b) => a.score - b.score).slice(0, 4) : (summaryData?.priorityWatchlist || []);
  const categories = demo ? [{ category: "headers", score: 72, sampleSize: 4 }, { category: "transport", score: 83, sampleSize: 4 }, { category: "cookies", score: 64, sampleSize: 3 }, { category: "metadata", score: 78, sampleSize: 4 }] : (summaryData?.categoryAverages || []);

  if (loading && !summaryData) {
    return (
      <div className="dashboard-v2-page em-dashboard-page">
        <Loader label="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard-v2-page em-dashboard-page">
      <section className="dashboard-v2-intro em-dashboard-intro">
        <div>
          <p className="dashboard-v2-kicker">SECURITY INTELLIGENCE / LIVE WORKSPACE</p>
          <h2>{demo ? "Portfolio security command center" : "Your security command center"}</h2>
          <p>{demo ? "A complete frontend preview using realistic sample data." : "Protected website state, deterministic scores and prioritized action in one workspace."}</p>
        </div>
        <div className="dashboard-v2-actions">
          {demo ? <Button variant="secondary" onClick={() => navigate("/")}>Back to landing</Button> : null}
          <Button onClick={() => navigate(demo ? "/register" : "/dashboard/add-website")}>{demo ? "Start assessment" : "Add website"}</Button>
        </div>
      </section>

      <section className="metric-grid-v2 em-metric-grid">
        <MetricCard label="PORTFOLIO SCORE" value={summary.average ?? "—"} note={summary.scanned ? `${summary.scanned} scored properties` : "Scan a website to establish a score"} icon={<ShieldCheck weight="duotone" />} emphasis />
        <MetricCard label="MONITORED SITES" value={summary.total} note={`${summary.total - summary.scanned} awaiting assessment`} icon={<GlobeHemisphereWest weight="duotone" />} />
        <MetricCard label="HIGH RISK" value={summary.high} note={summary.high ? "Priority review required" : "No high-risk scores here"} icon={<Siren weight="duotone" />} />
        <MetricCard label="SECURE RANGE" value={summary.low} note={`${summary.medium} currently need attention`} icon={<CheckCircle weight="duotone" />} />
      </section>

      <section className="em-command-grid">
        <article className="dashboard-v2-panel em-chart-panel">
          <div className="dashboard-v2-panel-heading"><div><small>SECURITY TRAJECTORY</small><h3>Score movement</h3></div><span><TrendUp /> {demo ? "Preview data" : `${trendValues.length} retained assessments`}</span></div>
          <div className="em-chart-wrap" aria-label="Security score trend chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 12, right: 16, left: -26, bottom: 0 }}>
                <defs><linearGradient id="emeraldArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55f5b3" stopOpacity={0.3}/><stop offset="100%" stopColor="#55f5b3" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid stroke="rgba(166,255,218,.06)" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#5f786d", fontSize: 9 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#5f786d", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#07160f", border: "1px solid rgba(85,245,179,.18)", borderRadius: 10, fontSize: 11 }} />
                <Area type="monotone" dataKey="score" stroke="#55f5b3" strokeWidth={2.4} fill="url(#emeraldArea)" activeDot={{ r: 4, fill: "#ecfff7" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-v2-panel em-risk-panel">
          <div className="dashboard-v2-panel-heading"><div><small>RISK OVERVIEW</small><h3>Current portfolio</h3></div><Target weight="duotone" /></div>
          <SecurityGauge score={summary.average} />
          <div className="risk-legend-v2"><span><i className="low"/>Low <b>{summary.low}</b></span><span><i className="medium"/>Medium <b>{summary.medium}</b></span><span><i className="high"/>High <b>{summary.high}</b></span></div>
        </article>
      </section>

      <section className="em-dashboard-detail-grid">
        <article className="dashboard-v2-panel em-assessments-panel">
          <div className="dashboard-v2-panel-heading"><div><small>RECENT ASSESSMENTS</small><h3>Latest website state</h3></div><Button variant="secondary" onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}>{viewMode === "cards" ? "Table" : "Cards"}</Button></div>
          <div className="mini-scan-table-v2">
            {websites.slice(0, 6).map((website) => {
              const risk = getRiskLabel(website.score);
              return <button type="button" key={website.id} onClick={() => onScan?.(website.id)}><span><i className={`status-dot status-${risk.key}`}/><b>{website.name}</b><small>{website.url}</small></span><strong>{website.score ?? "—"}</strong><em>{risk.label}</em><small>{website.latest_scan_status || "Not scanned"}</small><ArrowRight /></button>;
            })}
            {!websites.length ? <div className="dashboard-v2-empty">No website activity yet.</div> : null}
          </div>
        </article>

        <article className="dashboard-v2-panel em-priority-panel">
          <div className="dashboard-v2-panel-heading"><div><small>FIX FIRST</small><h3>Priority watchlist</h3></div><ChartLineUp weight="duotone" /></div>
          <div className="em-priority-list">
            {priority.length ? priority.map((website, index) => {
              const risk = getRiskLabel(website.score);
              const websiteId = website.websiteId || website.id;
              return <button type="button" onClick={() => onScan?.(websiteId)} key={websiteId}><b>{String(index + 1).padStart(2, "0")}</b><div><strong>{website.name}</strong><span>{risk.label} · score {website.score}</span></div><ArrowRight /></button>;
            }) : <p>No scored websites yet.</p>}
          </div>
        </article>
      </section>

      <section className="em-dashboard-detail-grid em-dashboard-visual-grid">
        <article className="dashboard-v2-panel em-bar-panel">
          <div className="dashboard-v2-panel-heading"><div><small>PORTFOLIO PROFILE</small><h3>Website score comparison</h3></div><span>{summary.scanned} scored</span></div>
          <div className="em-bar-wrap">
            {profileData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={profileData} margin={{ top: 12, right: 12, left: -25, bottom: 0 }}><CartesianGrid stroke="rgba(166,255,218,.06)" vertical={false}/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#667e73", fontSize: 9 }}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{ fill: "#667e73", fontSize: 9 }}/><Tooltip cursor={{ fill: "rgba(85,245,179,.04)" }} contentStyle={{ background: "#07160f", border: "1px solid rgba(85,245,179,.18)", borderRadius: 10, fontSize: 11 }}/><Bar dataKey="score" radius={[6,6,0,0]}>{profileData.map((entry) => <Cell key={entry.name} fill={CHART_COLORS[entry.risk]} />)}</Bar></BarChart></ResponsiveContainer> : <div className="dashboard-v2-empty">No scored websites yet.</div>}
          </div>
        </article>
        <CategoryExposurePanel categories={categories} demo={demo} />
      </section>

      {!demo ? (
        <section className="dashboard-v2-panel website-management-v2 em-management-panel">
          <div className="dashboard-v2-panel-heading"><div><small>WEBSITE MANAGEMENT</small><h3>Search, review and rescan</h3></div></div>
          <div className="dashboard-controls dashboard-controls-v2">
            <Input id="website-search" label="Search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Name or URL" />
            <div className="field-group"><label className="field-label" htmlFor="risk-filter">Risk</label><select className="field-input" id="risk-filter" value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}><option value="all">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="unscanned">Not scanned</option></select></div>
          </div>
          {error ? <div className="alert alert-error"><span>{error}</span>{onRetry ? <Button variant="secondary" onClick={onRetry}>Retry</Button> : null}</div> : null}
          {loading ? <Loader label="Loading your websites..." /> : viewMode === "cards" ? <WebsiteList websites={filteredWebsites} onDelete={onDelete} onScan={onScan} onEdit={setEditingWebsite} /> : <WebsiteTable websites={filteredWebsites} onDelete={onDelete} onScan={onScan} onEdit={setEditingWebsite} />}
        </section>
      ) : null}
      {editingWebsite ? <EditWebsiteModal website={editingWebsite} onClose={() => setEditingWebsite(null)} onSave={onUpdate} /> : null}
    </div>
  );
}

export default DashboardOverview;
