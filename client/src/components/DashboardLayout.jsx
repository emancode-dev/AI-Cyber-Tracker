import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout() {
  return <div className="dashboard-shell"><Sidebar /><div className="dashboard-main-column"><Navbar /><main className="dashboard-content"><Outlet /></main></div></div>;
}
export default DashboardLayout;
