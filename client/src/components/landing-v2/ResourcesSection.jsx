import Reveal from "./Reveal";

const resources = [
  ["01 / HEADERS", "Why HSTS matters after the first secure visit", "Transport security"],
  ["02 / COOKIES", "What Secure, HttpOnly and SameSite actually change", "Session protection"],
  ["03 / SCORING", "Why an AI security score should not be magic", "Deterministic risk"]
];

function ResourcesSection() {
  return (
    <section className="story-section resources-section-v2">
      <div className="page-width">
        <Reveal className="story-heading story-heading-center"><span className="cyber-kicker"><span/>LEARN AS YOU IMPROVE</span><h2>Security becomes less intimidating when the language gets clearer.</h2><p>These resource cards are visual placeholders for the educational content layer planned around the product.</p></Reveal>
        <div className="resource-grid-v2">{resources.map(([eyebrow,title,category],index)=><Reveal className="resource-card-v2" delay={index*70} key={title}><div className={`resource-art-v2 resource-art-${index+1}`}><i/><i/><i/><span>{eyebrow}</span></div><div><small>{category}</small><h3>{title}</h3><span>Coming soon ↗</span></div></Reveal>)}</div>
      </div>
    </section>
  );
}

export default ResourcesSection;
