import { useState } from "react";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { loginUser } from "../services/authService";
import { validateLogin } from "../utils/validation";
import { useAuth } from "../context/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { supabaseConfigured } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length) return;
    try {
      setLoading(true);
      await loginUser({ email, password });
      navigate("/dashboard");
    } catch (error) {
      setRequestError(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="WELCOME BACK" title="Enter your security workspace" description="Continue to your monitored sites, risk history and remediation roadmap.">
      <Link className="em-auth-back" to="/"><ArrowLeft /> Back to overview</Link>
      {!supabaseConfigured ? <p className="alert alert-error">Supabase client environment variables are missing.</p> : null}
      {requestError ? <p className="alert alert-error" role="alert">{requestError}</p> : null}
      <form className="em-auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Work email</label>
        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required aria-invalid={Boolean(errors.email)} />
        {errors.email ? <small className="field-error" role="alert">{errors.email}</small> : null}
        <div className="em-auth-label-row"><label htmlFor="password">Password</label><span>Minimum 8 characters</span></div>
        <div className="em-password-field">
          <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required aria-invalid={Boolean(errors.password)} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeSlash /> : <Eye />}</button>
        </div>
        {errors.password ? <small className="field-error" role="alert">{errors.password}</small> : null}
        <Button type="submit" disabled={loading || !supabaseConfigured}>{loading ? <Loader label="Signing in..." compact /> : "Sign in securely"}</Button>
      </form>
      <p className="em-auth-switch">New to Cyber AI Tracker? <Link to="/register">Create a free account</Link></p>
      <Link className="em-auth-preview" to="/preview/dashboard">Preview the dashboard without signing in</Link>
    </AuthShell>
  );
}

export default Login;
