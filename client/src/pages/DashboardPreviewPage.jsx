import { Bell, ChartLineUp, FileText, GearSix, House, PlusCircle, ShieldCheck, Timer } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import DashboardOverview from "../components/dashboard-v2/DashboardOverview";
import Brand from "../components/emerald/Brand";
import { demoWebsites } from "../data/visualDemoData";

const previewLinks = [[House, "Overview"], [PlusCircle, "Add website"], [FileText, "Reports"], [ChartLineUp, "History"], [GearSix, "Settings"]];

function DashboardPreviewPage() {
  return (
    <div className="dashboard-preview-page em-dashboard-shell">
      <aside className="preview-sidebar-v2 em-sidebar">
        <Brand compact />
        <nav className="sidebar-nav-v2"><span className="em-nav-label">WORKSPACE PREVIEW</span>{previewLinks.map(([Icon, label], index) => <span className={`sidebar-link-v2 ${index === 0 ? "active" : ""}`} key={label}><Icon weight="duotone" /><span>{label}</span></span>)}</nav>
        <div className="em-sidebar-retention"><Timer weight="duotone" /><div><strong>Privacy window</strong><small>Detailed data expires within 48h</small></div></div>
        <Link className="em-account-card" to="/register"><span>EA</span><div><strong>Evaluation mode</strong><small>Frontend-only preview</small></div><ShieldCheck weight="fill" /></Link>
      </aside>
      <main className="preview-main-v2">
        <header className="preview-topbar-v2 em-topbar"><div><small>CYBER AI TRACKER</small><strong>Security workspace</strong></div><div className="topbar-actions-v2"><span className="em-api-status"><i /> Visual preview</span><button className="em-icon-button" type="button" aria-label="Preview notifications"><Bell weight="duotone" /></button></div></header>
        <div className="preview-content-v2 em-dashboard-content"><DashboardOverview websites={demoWebsites} demo /></div>
      </main>
    </div>
  );
}

export default DashboardPreviewPage;
