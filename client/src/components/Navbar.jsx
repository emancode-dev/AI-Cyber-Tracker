import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { Bell, CaretDown, GearSix, ShieldWarning, SignOut, UserCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getDashboardSummary } from "../services/api";

function Navbar() {
  const { logout, user, profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    let active = true;
    getDashboardSummary().then((summary) => { if (active) setNotifications(summary.notifications || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="dashboard-topbar dashboard-topbar-v2 em-topbar">
      <div><small>CYBER AI TRACKER</small><strong>Security workspace</strong></div>
      <div className="topbar-actions-v2">
        <span className="em-api-status"><i /> API protected</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="em-icon-button em-notification-trigger" aria-label={`${notifications.length} priority notifications`}><Bell weight="duotone" />{notifications.length ? <i>{notifications.length}</i> : null}</DropdownMenu.Trigger>
          <DropdownMenu.Portal><DropdownMenu.Content className="em-user-menu em-notification-menu" align="end" sideOffset={8}><DropdownMenu.Label>LIVE PRIORITY SIGNALS</DropdownMenu.Label>{notifications.length ? notifications.map((notice) => <DropdownMenu.Item key={notice.id} onSelect={() => navigate(`/scan/${notice.websiteId}`)}><ShieldWarning/><span><b>{notice.title}</b><small>{notice.detail}</small></span></DropdownMenu.Item>) : <DropdownMenu.Item disabled><span><b>No priority alerts</b><small>Your current portfolio has no medium/high-risk scores.</small></span></DropdownMenu.Item>}</DropdownMenu.Content></DropdownMenu.Portal>
        </DropdownMenu.Root>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="em-user-trigger" aria-label="Open account menu">
            <span>{profile?.avatar_url ? <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" /> : displayName.slice(0, 2).toUpperCase()}</span>
            <div><b>{displayName}</b><small>{user?.email || "Authenticated user"}</small></div>
            <CaretDown />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="em-user-menu" align="end" sideOffset={8}>
              <DropdownMenu.Label>ACCOUNT</DropdownMenu.Label>
              <DropdownMenu.Item onSelect={() => navigate("/dashboard/settings")}><UserCircle /> Profile and privacy</DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => navigate("/dashboard/settings")}><GearSix /> Workspace settings</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item className="danger" onSelect={handleLogout}><SignOut /> Sign out</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

export default Navbar;
