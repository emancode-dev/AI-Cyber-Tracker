import { getOrCreateProfile } from "../repositories/profileRepository.js";
export async function meController(req, res) { const profile = await getOrCreateProfile(req.supabase, req.user); res.json({ success: true, data: { user: { id: req.user.id, email: req.user.email }, profile } }); }
