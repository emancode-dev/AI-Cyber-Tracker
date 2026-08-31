import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CheckCircle,
  GlobeHemisphereWest,
  ShieldWarning,
} from "@phosphor-icons/react";

const trend = [
  { label: "1", score: 58 }, { label: "2", score: 61 }, { label: "3", score: 65 },
  { label: "4", score: 63 }, { label: "5", score: 72 }, { label: "6", score: 78 },
  { label: "7", score: 84 },
];

const categories = [
  { name: "Headers", score: 82 },
  { name: "TLS", score: 91 },
  { name: "Cookies", score: 64 },
  { name: "Owner", score: 76 },
];

function LandingDashboardPreview() {
  return (
    <div className="em-dashboard-window" aria-label="CyberTracker dashboard preview">
      <div className="em-dashboard-browserbar">
        <span /><span /><span />
        <b>CyberTracker / Security workspace</b>
        <small>Preview data</small>
      </div>
      <div className="em-dashboard-frame">
        <aside className="em-dashboard-mini-sidebar">
          <strong>CT</strong>
          <span className="active"><GlobeHemisphereWest /></span>
          <span><ShieldWarning /></span>
          <span><CheckCircle /></span>
        </aside>
        <div className="em-dashboard-mini-main">
          <header>
            <div><small>OVERVIEW</small><h3>Security command center</h3></div>
            <button type="button">New scan <ArrowUpRight /></button>
          </header>
          <div className="em-dashboard-stat-row">
            <article><small>PORTFOLIO SCORE</small><b>84</b><span>+6 this month</span></article>
            <article><small>MONITORED SITES</small><b>04</b><span>3 assessed</span></article>
            <article><small>PRIORITY SIGNALS</small><b>07</b><span>2 need review</span></article>
          </div>
          <div className="em-dashboard-chart-grid">
            <article>
              <div><small>SCORE MOVEMENT</small><b>Last seven scans</b></div>
              <ResponsiveContainer width="100%" height={178}>
                <AreaChart data={trend} margin={{ top: 10, right: 4, left: -26, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" />
                  <XAxis dataKey="label" hide />
                  <YAxis domain={[40, 100]} tick={{ fill: "#70857d", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#07110d", border: "1px solid rgba(85,245,179,.2)", borderRadius: 10 }} />
                  <Area type="monotone" dataKey="score" stroke="#55f5b3" fill="rgba(85,245,179,.12)" strokeWidth={2.4} />
                </AreaChart>
              </ResponsiveContainer>
            </article>
            <article>
              <div><small>CATEGORY PROFILE</small><b>Current assessment</b></div>
              <ResponsiveContainer width="100%" height={178}>
                <BarChart data={categories} margin={{ top: 10, right: 4, left: -18, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#70857d", fontSize: 8 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "#07110d", border: "1px solid rgba(85,245,179,.2)", borderRadius: 10 }} />
                  <Bar dataKey="score" fill="#55f5b3" radius={[5, 5, 2, 2]} />
                </BarChart>
              </ResponsiveContainer>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingDashboardPreview;
