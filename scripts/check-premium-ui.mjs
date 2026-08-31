import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const files = [
  "client/src/pages/LandingPage.jsx",
  "client/src/components/emerald/EmeraldGlobe.jsx",
  "client/src/components/originkit/Globe.tsx",
  "client/src/components/emerald/CodeRain.jsx",
  "client/src/components/emerald/GlobalSignalMap.jsx",
  "client/src/components/emerald/TiltCard.jsx",
  "client/src/components/dashboard-v2/DashboardOverview.jsx",
  "client/src/components/dashboard-v2/CategoryExposurePanel.jsx",
  "client/src/styles/emerald.css"
];
const source = files.map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const checks = [
  ["Originkit Three.js globe", /InstancedMesh|from "three"/],
  ["world signal map", /ComposableMap/],
  ["cursor-reactive cards", /useSpring|rotateX/],
  ["continuous signal rail", /em-signal-track/],
  ["emerald design tokens", /--em-mint/],
  ["real icon system", /@phosphor-icons\/react/],
  ["dashboard charts", /ResponsiveContainer/],
  ["dashboard preview", /LandingDashboardPreview/],
  ["privacy narrative", /48-hour|48h/],
  ["FAQ", /em-faq-grid/],
  ["final CTA", /em-final-cta/],
  ["reduced-motion fallback", /prefers-reduced-motion/]
  ,["generated security visual", /security-exposure-glass/]
  ,["falling code background", /em-code-rain/]
  ,["backend category panel", /CategoryExposurePanel/]
];

let failed = 0;
for (const [name, pattern] of checks) {
  const ok = pattern.test(source);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
