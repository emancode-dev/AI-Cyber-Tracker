import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import WebsiteList from "../components/WebsiteList";
import WebsiteTable from "../components/WebsiteTable";
import { deleteWebsite, getWebsites } from "../services/websiteService";
import { getRiskLabel } from "../utils/risk";

function Dashboard() {
  const navigate = useNavigate(); const [websites, setWebsites] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [searchTerm, setSearchTerm] = useState(""); const [riskFilter, setRiskFilter] = useState("all"); const [viewMode, setViewMode] = useState("cards");
  async function loadWebsites() { try { setLoading(true); setError(""); setWebsites(await getWebsites()); } catch (e) { setError(e.message || "Could not load websites."); } finally { setLoading(false); } }
  useEffect(() => { loadWebsites(); }, []);
  async function handleDelete(id) { try { await deleteWebsite(id); setWebsites((items) => items.filter((item) => item.id !== id)); } catch (e) { setError(e.message); } }
  const normalized = searchTerm.trim().toLowerCase();
  const filteredWebsites = websites.filter((website) => { const searchOk = !normalized || website.name.toLowerCase().includes(normalized) || website.url.toLowerCase().includes(normalized); const risk = getRiskLabel(website.score); return searchOk && (riskFilter === "all" || risk.key === riskFilter); });
  return <section className="dashboard-panel"><div className="dashboard-heading-row"><div><p className="eyebrow">Supabase PostgreSQL + RLS</p><h2>My Websites</h2><p className="muted">This list is now persisted in PostgreSQL and scoped to the authenticated user.</p></div><Button onClick={() => navigate("/dashboard/add-website")}>+ Add website</Button></div><div className="dashboard-controls"><Input id="website-search" label="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Name or URL"/><div className="field-group"><label className="field-label" htmlFor="risk-filter">Risk</label><select className="field-input" id="risk-filter" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}><option value="all">All</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="unscanned">Not scanned</option></select></div></div><div className="view-tabs"><Button variant={viewMode === "cards" ? "primary" : "secondary"} onClick={() => setViewMode("cards")}>Cards</Button><Button variant={viewMode === "table" ? "primary" : "secondary"} onClick={() => setViewMode("table")}>Table</Button></div>{error ? <div className="alert alert-error"><span>{error}</span><Button variant="secondary" onClick={loadWebsites}>Retry</Button></div> : null}{loading ? <Loader label="Loading your websites..."/> : viewMode === "cards" ? <WebsiteList websites={filteredWebsites} onDelete={handleDelete} onScan={(id) => navigate(`/scan/${id}`)}/> : <WebsiteTable websites={filteredWebsites} onDelete={handleDelete} onScan={(id) => navigate(`/scan/${id}`)}/>}</section>;
}
export default Dashboard;
