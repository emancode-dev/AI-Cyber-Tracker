import { useEffect, useState } from "react";
import { X } from "@phosphor-icons/react";
import Button from "./Button";
import Input from "./Input";

function EditWebsiteModal({ website, onClose, onSave }) {
  const [name, setName] = useState(website?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(event) {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      await onSave(website.id, { name: name.trim() });
      onClose();
    } catch (requestError) {
      setError(requestError.message || "Could not update website.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="modal-panel em-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-website-title"><header><div><small>WEBSITE SETTINGS</small><h2 id="edit-website-title">Edit website label</h2></div><button type="button" aria-label="Close" onClick={onClose}><X /></button></header><form onSubmit={submit}><Input id="edit-name" label="Website name" value={name} onChange={(event) => setName(event.target.value)} required /><Input id="edit-url" label="Assessment target" type="url" value={website.url} readOnly helpText="The assessed URL is immutable so retained scores cannot be attached to another target. Add a new website to assess a different URL." /><div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving || !name.trim()}>{saving ? "Saving…" : "Save name"}</Button></div>{error ? <p className="alert alert-error">{error}</p> : null}</form></section></div>;
}

export default EditWebsiteModal;
