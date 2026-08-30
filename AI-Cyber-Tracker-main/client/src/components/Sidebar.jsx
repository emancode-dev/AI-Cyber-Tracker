import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Dashboard navigation">
      <NavLink className="sidebar-brand" to="/"><span className="brand-mark">A</span><span>AI Cyber Tracker</span></NavLink>
      <nav className="sidebar-nav">
        <NavLink end to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`.trim()}>Websites</NavLink>
        <NavLink to="/dashboard/add-website" className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`.trim()}>Add website</NavLink>
      </nav>
      <p className="sidebar-note">Phase 3–4: Supabase Auth/Postgres + safe scanner learning.</p>
    </aside>
  );
}
export default Sidebar;
