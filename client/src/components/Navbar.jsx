import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="dashboard-topbar">
      <div><p className="eyebrow">Protected workspace</p><h1>AI Cyber Tracker</h1></div>
      <div className="topbar-actions">
        <span className="user-chip">{user?.user_metadata?.name || user?.email || "User"}</span>
        <Button variant="secondary" onClick={handleLogout}>Logout</Button>
      </div>
    </header>
  );
}
export default Navbar;
