import {
  ChartLineUp, FileText, GearSix,
  House, PlusCircle, ShieldCheck, Timer
} from "@phosphor-icons/react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Brand from "./emerald/Brand";

const links = [
  ["Overview", "/dashboard", House, true],
  ["Add website", "/dashboard/add-website", PlusCircle],
  ["Reports", "/dashboard/reports", FileText],
  ["History", "/dashboard/history", ChartLineUp],
  ["Settings", "/dashboard/settings", GearSix]
];

function Sidebar() {
  const { user, profile } = useAuth();
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Workspace owner";
  return (
    <aside className="sidebar sidebar-v2 em-sidebar" aria-label="Dashboard navigation">
      <Brand compact />
      <nav className="sidebar-nav-v2">
        <span className="em-nav-label">WORKSPACE</span>
        {links.map(([label, to, Icon, end]) => (
          <NavLink end={Boolean(end)} to={to} key={label} className={({ isActive }) => `sidebar-link-v2 ${isActive ? "active" : ""}`.trim()}>
            <Icon weight="duotone" /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="em-sidebar-retention"><Timer weight="duotone" /><div><strong>Privacy window</strong><small>Detailed data expires within 48h</small></div></div>
      <NavLink className="em-account-card" to="/dashboard/settings">
        <span>{profile?.avatar_url ? <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" /> : displayName.slice(0, 2).toUpperCase()}</span>
        <div><strong>{displayName}</strong><small>{user?.email || "Secure preview"}</small></div>
        <ShieldCheck weight="fill" />
      </NavLink>
    </aside>
  );
}

export default Sidebar;
