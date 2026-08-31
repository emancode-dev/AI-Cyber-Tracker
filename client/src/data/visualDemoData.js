export const marketingStats = [
  { value: "20K+", label: "Security signals reviewed", note: "Illustrative preview metric" },
  { value: "98%", label: "Assessment completion", note: "Illustrative preview metric" },
  { value: "200+", label: "Recommendations generated", note: "Illustrative preview metric" }
];

export const demoWebsites = [
  { id: "demo-1", name: "Northstar Commerce", url: "https://northstar.example", score: 82, risk_level: "low", latest_scan_status: "completed", latest_scan_id: "scan-1" },
  { id: "demo-2", name: "Atlas Portal", url: "https://atlas.example", score: 64, risk_level: "medium", latest_scan_status: "completed", latest_scan_id: "scan-2" },
  { id: "demo-3", name: "Orbit Studio", url: "https://orbit.example", score: 48, risk_level: "high", latest_scan_status: "completed", latest_scan_id: "scan-3" },
  { id: "demo-4", name: "New Product", url: "https://new.example", score: null, risk_level: null, latest_scan_status: null, latest_scan_id: null }
];

export const demoFindings = [
  { title: "HSTS not observed", category: "Headers", severity: "Medium", status: "Needs attention" },
  { title: "Admin MFA needs confirmation", category: "Context", severity: "High", status: "Owner context" },
  { title: "HttpOnly cookie protection", category: "Cookies", severity: "Medium", status: "Needs attention" }
];
