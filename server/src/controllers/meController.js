import { getOrCreateProfile, updateProfile } from "../repositories/profileRepository.js";
export async function meController(req, res) { const profile = await getOrCreateProfile(req.supabase, req.user); res.json({ success: true, data: { user: { id: req.user.id, email: req.user.email }, profile } }); }
export async function updateMeController(req, res) {
  const changes = {};
  if (typeof req.body.name === "string") changes.name = req.body.name.trim();
  if (Object.prototype.hasOwnProperty.call(req.body, "avatarUrl")) changes.avatar_url = req.body.avatarUrl || null;
  const profile = await updateProfile(req.supabase, req.user.id, changes);
  res.json({ success: true, data: { user: { id: req.user.id, email: req.user.email }, profile } });
}
