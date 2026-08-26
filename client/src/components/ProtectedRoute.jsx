import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { authStatus } = useAuth();

  if (authStatus === "checking") {
    return <h1>Checking authentication...</h1>;
  }

  if (authStatus === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;