import test from "node:test";
import assert from "node:assert/strict";
import { buildDashboardSummary } from "../src/services/dashboardService.js";

test("dashboard summary uses chronological retained history and current website scores", () => {
  const websites = [
    { id: "a", name: "Alpha", url: "https://a.test/", score: 52, latest_scan_id: "s1" },
    { id: "b", name: "Beta", url: "https://b.test/", score: 88, latest_scan_id: "s2" },
    { id: "c", name: "Gamma", url: "https://c.test/", score: null }
  ];
  const history = [
    { id: "h1", website_id: "a", score: 44, risk_level: "high", category_scores: { headers: 40 }, created_at: "2026-08-01T00:00:00Z" },
    { id: "h2", website_id: "a", score: 52, risk_level: "high", category_scores: { headers: 60 }, created_at: "2026-08-02T00:00:00Z" },
    { id: "h3", website_id: "b", score: 88, risk_level: "low", category_scores: { headers: 80 }, created_at: "2026-08-03T00:00:00Z" }
  ];
  const summary = buildDashboardSummary(websites, history, new Date("2026-08-31T00:00:00Z"));
  assert.equal(summary.metrics.portfolioScore, 70);
  assert.deepEqual(summary.metrics.riskCounts, { low: 1, medium: 0, high: 1, unscanned: 1 });
  assert.deepEqual(summary.trend.map((point) => point.score), [44, 52, 88]);
  assert.equal(summary.priorityWatchlist[0].websiteId, "a");
  assert.equal(summary.categoryAverages[0].score, 70);
  assert.equal(summary.notifications.length, 1);
});
