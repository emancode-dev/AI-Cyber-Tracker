import { useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { demoFindings } from "../../data/visualDemoData";

function DashboardShowcase() {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Findings", "Scans", "Roadmap"];

  return (
    <section className="story-section dashboard-showcase-section">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center">
          <span className="cyber-kicker"><span/>YOUR SECURITY WORKSPACE</span>
          <h2>“Okay. So where does all of this go?”</h2>
          <p className="conversation-answer">Into one place.</p>
        </Reveal>
        <Reveal className="landing-dashboard" delay={100}>
          <aside><div className="mini-brand"><i/>CA</div>{["Overview","Websites","Scans","Findings","Reports","History"].map((item,index)=><span className={index===0?"active":""} key={item}>{item}<i/></span>)}</aside>
          <main>
            <header><div><small>SECURITY WORKSPACE</small><strong>Dashboard</strong></div><div className="mini-avatar">EA</div></header>
            <div className="dashboard-demo-tabs">{tabs.map((item)=><button type="button" key={item} className={tab===item?"active":""} onClick={()=>setTab(item)}>{item}</button>)}</div>
            {tab === "Overview" && <div className="demo-overview"><div className="demo-metrics"><article><small>SECURITY SCORE</small><strong>78</strong><span>+6 since last scan</span></article><article><small>OPEN FINDINGS</small><strong>12</strong><span>3 high priority</span></article><article><small>LATEST SCAN</small><strong>2h</strong><span>Completed</span></article></div><div className="demo-main-grid"><div className="demo-chart"><small>SECURITY PROFILE</small><svg viewBox="0 0 600 180" role="img" aria-label="Illustrative score trend"><path d="M20 135 C80 120, 110 150, 160 112 S250 90, 300 105 S390 55, 450 75 S530 35, 580 48" fill="none" stroke="currentColor" strokeWidth="4"/><path d="M20 135 C80 120, 110 150, 160 112 S250 90, 300 105 S390 55, 450 75 S530 35, 580 48 L580 170 L20 170 Z" fill="currentColor" opacity=".08"/></svg></div><div className="demo-gauge"><small>RISK OVERVIEW</small><div className="mini-gauge"><strong>78</strong><span>MEDIUM</span></div></div></div></div>}
            {tab === "Findings" && <div className="demo-list">{demoFindings.map((finding)=><article key={finding.title}><span className={`demo-severity ${finding.severity.toLowerCase()}`}/><div><small>{finding.category} · {finding.severity}</small><strong>{finding.title}</strong></div><b>{finding.status}</b></article>)}</div>}
            {tab === "Scans" && <div className="demo-table">{[['northstar.example','82','Low','Today'],['atlas.example','64','Medium','Yesterday'],['orbit.example','48','High','Aug 28']].map((row)=><div key={row[0]}>{row.map((cell)=><span key={cell}>{cell}</span>)}</div>)}</div>}
            {tab === "Roadmap" && <div className="demo-roadmap">{[['TODAY','Fix session cookie flags'],['THIS WEEK','Review admin MFA and HSTS'],['THIS MONTH','Strengthen policy coverage']].map(([when,task])=><article key={when}><small>{when}</small><strong>{task}</strong><span>Prioritized from verified evidence and owner context.</span></article>)}</div>}
          </main>
        </Reveal>
        <div className="showcase-action"><Link className="cyber-button cyber-button-ghost" to="/preview/dashboard">Open full dashboard preview ↗</Link></div>
      </div>
    </section>
  );
}

export default DashboardShowcase;
