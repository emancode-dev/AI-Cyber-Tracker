import { useState } from "react";
import Reveal from "./Reveal";

const items = [
  ["Can I scan any website?", "No. The product is designed for websites you own or are explicitly authorized to assess."],
  ["Does Cyber AI Tracker hack my site?", "No. The current scanner focuses on defensive, passive observations and deliberately excludes brute force and destructive exploitation."],
  ["Does AI calculate the security score?", "No. The score is deterministic JavaScript logic. AI is reserved for explaining minimized verified evidence."],
  ["What information is sent to AI?", "The planned payload is minimized to the score, finding codes and only the questionnaire context required to explain those findings."],
  ["What happens after 48 hours?", "The product plan limits detailed assessment data to a short retention window and later includes an explicit delete-now flow."],
  ["What if the AI service is unavailable?", "Scanner findings, questionnaire context and the deterministic score remain useful without AI."],
  ["Does a passing scan mean I am 100% secure?", "No. Cyber AI Tracker is an assessment aid, not proof of absolute security."],
];

function CyberFAQ() {
  const [open, setOpen] = useState(0);
  return <section className="story-section faq-v2" id="faq"><div className="page-width faq-v2-grid"><Reveal className="story-heading"><span className="cyber-kicker"><span/>FREQUENTLY ASKED</span><h2>The questions people usually ask next.</h2><p>Short answers, clear boundaries.</p></Reveal><div className="faq-v2-list">{items.map(([question,answer],index)=><article key={question} className={open===index?"open":""}><button type="button" aria-expanded={open===index} onClick={()=>setOpen(open===index?-1:index)}><span>{question}</span><b>{open===index?'−':'+'}</b></button><div className="faq-v2-answer"><p>{answer}</p></div></article>)}</div></div></section>;
}

export default CyberFAQ;
