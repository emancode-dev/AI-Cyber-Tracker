import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="border-b px-6 py-4">

      <div className="max-w-6xl mx-auto flex justify-between items-center">

        <h1 className="text-xl font-bold">
          AI Cyber Tracker
        </h1>

        <Button
          variant="secondary"
          onClick={handleLogout}
        >
          Logout
        </Button>

      </div>

    </nav>
  );
}

export default Navbar;