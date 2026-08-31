import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Loader from "./Loader";
import { createWebsite } from "../services/websiteService";
import { validateWebsite } from "../utils/validation";

function AddWebsiteModal({ onClose, onAddWebsite }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateWebsite({ name, url, authorizationConfirmed });
    setErrors(nextErrors);
    setRequestError("");
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      const website = await createWebsite({
        name: name.trim(),
        url: url.trim(),
        authorizationConfirmed
      });
      onAddWebsite?.(website);
      onClose();
    } catch (error) {
      setRequestError(error.message || "Could not add website.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="add-website-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header"><div><p className="eyebrow">Supabase-backed website</p><h2 id="add-website-modal-title">Add website</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close">×</button></div>
        {requestError ? <p className="alert alert-error">{requestError}</p> : null}
        <form className="stack-form" onSubmit={handleSubmit} noValidate>
          <Input id="modal-name" label="Website name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
          <Input id="modal-url" label="Website URL" type="url" value={url} onChange={(e) => setUrl(e.target.value)} error={errors.url} required />
          <label className="check-row"><input type="checkbox" checked={authorizationConfirmed} onChange={(e) => setAuthorizationConfirmed(e.target.checked)} /><span>I own this website or have explicit permission to assess it.</span></label>
          {errors.authorizationConfirmed ? <p className="field-error">{errors.authorizationConfirmed}</p> : null}
          <div className="button-row"><Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? <Loader label="Adding..." compact /> : "Add website"}</Button></div>
        </form>
      </div>
    </div>
  );
}

export default AddWebsiteModal;
