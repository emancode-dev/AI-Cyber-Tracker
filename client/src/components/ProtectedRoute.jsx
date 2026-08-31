import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loader from "./Loader";

function ProtectedRoute({ children }) {
  const { authStatus } = useAuth();
  if (authStatus === "checking") {
    return <div className="centered-page"><Loader label="Checking session..." /></div>;
  }
  if (authStatus === "unauthenticated") return <Navigate to="/login" replace />;
  return children;
}
export default ProtectedRoute;
