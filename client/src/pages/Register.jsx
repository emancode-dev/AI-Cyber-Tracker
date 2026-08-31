import { useState } from "react";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { registerUser } from "../services/authService";
import { validateRegistration } from "../utils/validation";
import { useAuth } from "../context/useAuth";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const websiteUrl = searchParams.get("website") || "";
  const navigate = useNavigate();
  const { supabaseConfigured } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegistration({ name, email, password });
    setErrors(nextErrors);
    setRequestError("");
    setSuccessMessage("");
    if (Object.keys(nextErrors).length) return;
    try {
      setLoading(true);
      const data = await registerUser({ name, email, password });
      if (data.session) navigate(websiteUrl ? `/dashboard/add-website?website=${encodeURIComponent(websiteUrl)}` : "/dashboard");
      else setSuccessMessage("Account created. Confirm the email from Supabase, then sign in.");
    } catch (error) {
      setRequestError(error.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="CREATE WORKSPACE" title="Start with a safer website" description="Create your private workspace and run a consent-based website assessment in minutes.">
      <Link className="em-auth-back" to="/"><ArrowLeft /> Back to overview</Link>
      {!supabaseConfigured ? <p className="alert alert-error">Supabase client environment variables are missing.</p> : null}
      {requestError ? <p className="alert alert-error" role="alert">{requestError}</p> : null}
      {successMessage ? <p className="alert alert-info" role="status">{successMessage}</p> : null}
      <form className="em-auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Your name</label>
        <input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" autoComplete="name" required aria-invalid={Boolean(errors.name)} />
        {errors.name ? <small className="field-error" role="alert">{errors.name}</small> : null}
        <label htmlFor="register-email">Work email</label>
        <input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" autoComplete="email" required aria-invalid={Boolean(errors.email)} />
        {errors.email ? <small className="field-error" role="alert">{errors.email}</small> : null}
        <div className="em-auth-label-row"><label htmlFor="register-password">Password</label><span>8+ characters</span></div>
        <div className="em-password-field">
          <input id="register-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" autoComplete="new-password" required aria-invalid={Boolean(errors.password)} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeSlash /> : <Eye />}</button>
        </div>
        {errors.password ? <small className="field-error" role="alert">{errors.password}</small> : null}
        <Button type="submit" disabled={loading || !supabaseConfigured}>{loading ? <Loader label="Creating workspace..." compact /> : "Create secure workspace"}</Button>
      </form>
      <p className="em-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      <p className="em-auth-legal">By continuing, you confirm that you will assess only websites you own or are authorized to test.</p>
    </AuthShell>
  );
}

export default Register;
