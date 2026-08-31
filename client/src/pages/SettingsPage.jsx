import { useState } from "react";
import { Camera, CheckCircle, Clock, Database, Key, LockKey, ShieldCheck, SignOut, UserCircle } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../components/Button";
import Input from "../components/Input";
import { supabase } from "../config/supabase";
import { useAuth } from "../context/useAuth";
import { updateMe } from "../services/api";

function SettingsPage() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.name || user?.user_metadata?.name || "");
  const [profileBusy, setProfileBusy] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function handleProfileSave(event) {
    event.preventDefault();
    try {
      setProfileBusy(true);
      await updateMe({ name });
      await supabase.auth.updateUser({ data: { name: name.trim() } });
      await refreshProfile();
      toast.success("Profile updated.");
    } catch (error) { toast.error(error.message || "Could not update profile."); }
    finally { setProfileBusy(false); }
  }

  async function handleAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error("Use a PNG, JPEG, or WebP image up to 2 MB."); event.target.value = ""; return;
    }
    try {
      setProfileBusy(true);
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const objectPath = `${user.id}/avatar-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(objectPath, file, { cacheControl: "3600", contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
      await updateMe({ avatarUrl: data.publicUrl });
      await refreshProfile();
      toast.success("Avatar updated.");
    } catch (error) { toast.error(error.message || "Could not upload avatar. Apply the latest Supabase migration first."); }
    finally { setProfileBusy(false); event.target.value = ""; }
  }

  async function handlePassword(event) {
    event.preventDefault();
    if (password.length < 10) return toast.error("Use at least 10 characters.");
    if (password !== passwordConfirm) return toast.error("Passwords do not match.");
    try {
      setPasswordBusy(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(""); setPasswordConfirm("");
      toast.success("Password changed securely through Supabase Auth.");
    } catch (error) { toast.error(error.message || "Could not change password."); }
    finally { setPasswordBusy(false); }
  }

  async function handleLogout() { await logout(); navigate("/login"); }
  const displayName = profile?.name || user?.user_metadata?.name || "Workspace owner";

  return <section className="em-subpage em-settings-page"><header><span className="em-section-label">ACCOUNT & PRIVACY</span><h1>Your protected workspace</h1><p>Update your real account profile and review the security boundaries protecting it.</p></header><div className="em-settings-live-grid"><form className="em-settings-form" onSubmit={handleProfileSave}><div className="em-settings-form-heading"><UserCircle weight="duotone"/><div><small>PROFILE</small><h2>Identity and avatar</h2></div></div><div className="em-avatar-editor"><span>{profile?.avatar_url ? <img src={profile.avatar_url} alt="Current profile avatar" referrerPolicy="no-referrer"/> : displayName.slice(0,2).toUpperCase()}</span><label className="button button-secondary"><Camera/> Upload avatar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatar} disabled={profileBusy}/></label><small>PNG, JPEG or WebP · 2 MB maximum</small></div><Input id="profile-name" label="Display name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required/><Input id="profile-email" label="Email address" value={user?.email || ""} disabled/><Button type="submit" disabled={profileBusy || name.trim().length < 2}>{profileBusy ? "Saving…" : "Save profile"}</Button></form><form className="em-settings-form" onSubmit={handlePassword}><div className="em-settings-form-heading"><Key weight="duotone"/><div><small>ACCOUNT SECURITY</small><h2>Change password</h2></div></div><p className="muted">Supabase Auth updates the password; it is never sent to the CyberTracker Express API.</p><Input id="new-password" type="password" label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={10} required/><Input id="confirm-password" type="password" label="Confirm password" autoComplete="new-password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} minLength={10} required/><Button type="submit" disabled={passwordBusy}>{passwordBusy ? "Updating…" : "Update password"}</Button><div className="em-session-facts"><span><CheckCircle weight="fill"/>Session verified by Supabase</span><span><Clock/>Last sign-in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Current session"}</span></div></form></div><div className="em-settings-grid"><article><ShieldCheck weight="duotone"/><div><small>ACCOUNT</small><h2>{displayName}</h2><p>{user?.email || "Authenticated with Supabase"}</p></div></article><article><LockKey weight="duotone"/><div><small>AUTHORIZATION</small><h2>Bearer token verification</h2><p>The Express API independently verifies each protected request.</p></div></article><article><Database weight="duotone"/><div><small>DATABASE</small><h2>Row-level security</h2><p>Website, scan, answer, report and history access is owner-scoped.</p></div></article><article><Clock weight="duotone"/><div><small>RETENTION</small><h2>48-hour detail window</h2><p>Schedule the included cleanup function hourly with Supabase Cron.</p></div></article></div><div className="em-settings-action"><div><SignOut/><span><strong>End this browser session</strong><small>Your server-side data is unchanged.</small></span></div><Button variant="secondary" onClick={handleLogout}>Sign out</Button></div></section>;
}

export default SettingsPage;
