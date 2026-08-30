import { createWebsite, deleteWebsite, getAllWebsites, getOwnedWebsite, updateWebsite } from "../services/websiteService.js";
export async function listWebsitesController(req, res) { res.json({ success: true, data: { websites: await getAllWebsites(req.supabase) } }); }
export async function getWebsiteController(req, res) { res.json({ success: true, data: { website: await getOwnedWebsite(req.supabase, req.params.id) } }); }
export async function createWebsiteController(req, res) { const website = await createWebsite(req.supabase, req.user.id, req.body); res.status(201).json({ success: true, data: { website } }); }
export async function updateWebsiteController(req, res) { const website = await updateWebsite(req.supabase, req.params.id, req.body || {}); res.json({ success: true, data: { website } }); }
export async function deleteWebsiteController(req, res) { await deleteWebsite(req.supabase, req.params.id); res.json({ success: true, data: null, message: "Website deleted." }); }
