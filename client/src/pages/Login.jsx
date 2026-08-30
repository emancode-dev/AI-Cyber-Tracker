import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { loginUser } from "../services/authService";
import { validateLogin } from "../utils/validation";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [errors, setErrors] = useState({}); const [requestError, setRequestError] = useState(""); const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); const { supabaseConfigured } = useAuth();
  async function handleSubmit(event) {
    event.preventDefault(); const nextErrors = validateLogin({ email, password }); setErrors(nextErrors); setRequestError(""); if (Object.keys(nextErrors).length) return;
    try { setLoading(true); await loginUser({ email, password }); navigate("/dashboard"); } catch (error) { setRequestError(error.message || "Login failed."); } finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-card"><Link className="back-link" to="/">← Back to home</Link><p className="eyebrow">Supabase Auth</p><h1>Login</h1><p className="muted">Your browser signs in with Supabase. The Express API still verifies the access token on every protected request.</p>{!supabaseConfigured ? <p className="alert alert-error">Supabase client environment variables are missing.</p> : null}{requestError ? <p className="alert alert-error" role="alert">{requestError}</p> : null}<form className="stack-form" onSubmit={handleSubmit} noValidate><Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required/><Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required/><Button type="submit" disabled={loading || !supabaseConfigured}>{loading ? <Loader label="Logging in..." compact/> : "Login"}</Button></form><p className="auth-switch">New here? <Link to="/register">Create an account</Link></p></section></main>;
}
export default Login;
