import { getDashboardSummary } from "../services/dashboardService.js";

export async function dashboardSummaryController(req, res) {
  const summary = await getDashboardSummary(req.supabase);
  res.json({ success: true, data: { summary } });
}
