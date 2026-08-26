import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ScanPage from "./pages/ScanPage";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scan/:websiteId"
          element={
            <ProtectedRoute>
              <ScanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;