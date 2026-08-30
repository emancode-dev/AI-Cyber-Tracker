import { useState } from "react";
const faqs = [
  { id: 1, question: "Can I scan any website?", answer: "No. The product is intended only for websites you own or are explicitly authorized to assess." },
  { id: 2, question: "Does AI decide the score?", answer: "No. The planned score is deterministic code. AI is a later explanation layer only." },
  { id: 3, question: "Is the scanner a full penetration test?", answer: "No. This 40-day version is a passive defensive assessment with a deliberately limited scope." }
];
function FAQSection() {
  const [openFaqId, setOpenFaqId] = useState(null);
  return <section className="section page-width" id="faq"><div className="section-heading"><p className="eyebrow">FAQ</p><h2>Clear boundaries are part of the product.</h2></div><div className="faq-list">{faqs.map((faq) => { const open = openFaqId === faq.id; return <article className="faq-item" key={faq.id}><button className="faq-question" type="button" onClick={() => setOpenFaqId(open ? null : faq.id)} aria-expanded={open}><span>{faq.question}</span><span>{open ? "−" : "+"}</span></button>{open ? <p className="faq-answer">{faq.answer}</p> : null}</article>; })}</div></section>;
}
export default FAQSection;
