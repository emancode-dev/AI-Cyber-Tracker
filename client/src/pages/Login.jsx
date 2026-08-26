import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    // Temporary login simulation.
    // Later this will be a fetch() request
    // to our backend.

    setTimeout(() => {
      if (!email || !password) {
        setError("Please enter email and password.");
        setLoading(false);
        return;
      }

      login();

      setLoading(false);

      navigate("/dashboard");
    }, 1000);
  }

  return (
    <div>
      <h1>Login</h1>

      <p>Welcome back to AI Cyber Tracker.</p>

      {error && (
        <p>{error}</p>
      )}

      <form onSubmit={handleSubmit}>

        <div>
          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Logging in..."
            : "Login"}
        </button>

      </form>
    </div>
  );
}

export default Login;