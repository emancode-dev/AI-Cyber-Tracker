import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { registerUser } from "../services/authService";
import { validateRegistration } from "../utils/validation";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [errors, setErrors] = useState({}); const [requestError, setRequestError] = useState(""); const [successMessage, setSuccessMessage] = useState(""); const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams(); const websiteUrl = searchParams.get("website") || ""; const navigate = useNavigate(); const { supabaseConfigured } = useAuth();
  async function handleSubmit(event) {
    event.preventDefault(); const nextErrors = validateRegistration({ name, email, password }); setErrors(nextErrors); setRequestError(""); setSuccessMessage(""); if (Object.keys(nextErrors).length) return;
    try { setLoading(true); const data = await registerUser({ name, email, password }); if (data.session) navigate(websiteUrl ? `/dashboard/add-website?website=${encodeURIComponent(websiteUrl)}` : "/dashboard"); else setSuccessMessage("Account created. Check your email to confirm it, then log in."); } catch (error) { setRequestError(error.message || "Registration failed."); } finally { setLoading(false); }
  }
  return <main className="auth-page"><section className="auth-card"><Link className="back-link" to="/">← Back to home</Link><p className="eyebrow">Supabase Auth</p><h1>Create account</h1><p className="muted">If email confirmation is enabled in Supabase, signup returns a user but no active session until the email is confirmed.</p>{!supabaseConfigured ? <p className="alert alert-error">Supabase client environment variables are missing.</p> : null}{requestError ? <p className="alert alert-error">{requestError}</p> : null}{successMessage ? <p className="alert alert-info">{successMessage}</p> : null}<form className="stack-form" onSubmit={handleSubmit} noValidate><Input id="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required/><Input id="register-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required/><Input id="register-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} helpText="At least 8 characters." required/><Button type="submit" disabled={loading || !supabaseConfigured}>{loading ? <Loader label="Creating account..." compact/> : "Create account"}</Button></form><p className="auth-switch">Already registered? <Link to="/login">Login</Link></p></section></main>;
}
export default Register;
