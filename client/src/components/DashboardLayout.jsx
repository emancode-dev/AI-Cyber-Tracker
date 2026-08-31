import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout() {
  return <div className="dashboard-shell dashboard-shell-v2"><Sidebar/><div className="dashboard-main-column"><Navbar/><main className="dashboard-content dashboard-content-v2"><Outlet/></main></div></div>;
}

export default DashboardLayout;
