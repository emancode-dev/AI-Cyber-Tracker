import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddWebsitePage from "./pages/AddWebsitePage";
import ScanPage from "./pages/ScanPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  return <BrowserRouter><Routes><Route path="/" element={<LandingPage/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/><Route path="/dashboard" element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}><Route index element={<Dashboard/>}/><Route path="add-website" element={<AddWebsitePage/>}/></Route><Route path="/scan/:websiteId" element={<ProtectedRoute><ScanPage/></ProtectedRoute>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></BrowserRouter>;
}
export default App;
