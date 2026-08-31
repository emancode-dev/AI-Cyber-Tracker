import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Loader from "./components/Loader";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddWebsitePage = lazy(() => import("./pages/AddWebsitePage"));
const ScanPage = lazy(() => import("./pages/ScanPage"));
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const DashboardPreviewPage = lazy(() => import("./pages/DashboardPreviewPage"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-right" richColors closeButton />
      <Suspense fallback={<main className="em-route-loader"><Loader label="Loading protected workspace..." /></main>}>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/preview/dashboard" element={<DashboardPreviewPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="add-website" element={<AddWebsitePage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route
          path="/scan/:websiteId"
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/questionnaire/:scanId"
          element={
            <ProtectedRoute>
              <QuestionnairePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis/:scanId"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:scanId"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
