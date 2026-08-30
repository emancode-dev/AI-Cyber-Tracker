import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { createWebsite } from "../services/websiteService";
import { validateWebsite } from "../utils/validation";
function AddWebsitePage() {
  const [searchParams] = useSearchParams(); const navigate = useNavigate();
  const [name, setName] = useState(""); const [url, setUrl] = useState(() => searchParams.get("website") || ""); const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false); const [errors, setErrors] = useState({}); const [requestError, setRequestError] = useState(""); const [loading, setLoading] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault(); const nextErrors = validateWebsite({ name, url, authorizationConfirmed }); setErrors(nextErrors); setRequestError(""); if (Object.keys(nextErrors).length) return;
    try { setLoading(true); await createWebsite({ name: name.trim(), url: url.trim(), authorizationConfirmed }); navigate("/dashboard"); } catch (error) { setRequestError(error.message || "Could not add website."); } finally { setLoading(false); }
  }
  return <section className="dashboard-panel narrow-panel"><p className="eyebrow">Owned/authorized targets only</p><h2>Add a website</h2><p className="muted">Basic form validation happens here. The server independently normalizes the domain and enforces ownership/authorization state in PostgreSQL.</p>{requestError ? <p className="alert alert-error">{requestError}</p> : null}<form className="stack-form" onSubmit={handleSubmit} noValidate><Input id="website-name" label="Website name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required/><Input id="website-url" label="Website URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} error={errors.url} placeholder="https://example.com" required/><label className="check-row"><input type="checkbox" checked={authorizationConfirmed} onChange={(e) => setAuthorizationConfirmed(e.target.checked)}/><span>I own this website or have explicit permission to assess it.</span></label>{errors.authorizationConfirmed ? <p className="field-error" role="alert">{errors.authorizationConfirmed}</p> : null}<div className="button-row"><Button variant="secondary" onClick={() => navigate("/dashboard")} disabled={loading}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? <Loader label="Saving..." compact/> : "Add website"}</Button></div></form></section>;
}
export default AddWebsitePage;
