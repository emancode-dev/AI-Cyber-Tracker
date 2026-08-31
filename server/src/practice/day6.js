import { env } from "../config/env.js";
const mockFindings = [{ code: "HSTS_MISSING", severity: "medium" }, { code: "CSP_MISSING", severity: "medium" }];
console.log(JSON.stringify({ apiPort: env.port, findings: mockFindings.map((finding, index) => ({ id: index + 1, ...finding })) }, null, 2));
