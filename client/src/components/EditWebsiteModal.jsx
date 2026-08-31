import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import Button from "./Button";
import Input from "./Input";

function EditWebsiteModal({ website, onClose, onSave }) {
  const [name, setName] = useState(website?.name || "");
  const [url, setUrl] = useState(website?.url || "");
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const urlChanged = url.trim() !== website.url;
  async function submit(event) {
    event.preventDefault();
    if (urlChanged && !confirmed) {
      setError("Confirm authorization before changing the assessment target.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await onSave(website.id, { name: name.trim(), ...(urlChanged ? { url: url.trim(), authorizationConfirmed: true } : {}) });
      onClose();
    } catch (requestError) {
      setError(requestError.message || "Could not update website.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-panel em-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-website-title"><header><div><small>WEBSITE SETTINGS</small><h2 id="edit-website-title">Edit assessment target</h2></div><button type="button" aria-label="Close" onClick={onClose}><X /></button></header><form onSubmit={submit}><Input id="edit-name" label="Website name" value={name} onChange={(event) => setName(event.target.value)} required /><Input id="edit-url" label="Website URL" type="url" value={url} onChange={(event) => setUrl(event.target.value)} required /><label className={`checkbox-row ${urlChanged ? "required" : ""}`}><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={!urlChanged}/><span>I own this website or have explicit permission to assess the changed URL.</span></label>{error ? <p className="alert alert-error">{error}</p> : null}<div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving || !name.trim() || !url.trim()}>{saving ? "Saving…" : "Save changes"}</Button></div></form></section></div>;
}

export default EditWebsiteModal;
