import { useEffect, useRef, useState } from "react";
import SecurityOrb from "./SecurityOrb";

const stages = [
  ["HTTPS + TLS", "Transport and certificate signals arrive first."],
  ["Headers + cookies", "Browser-facing controls become structured observations."],
  ["Forms + metadata", "Public context is detected without attacking the application."],
  ["Normalized findings", "Everything leaves the scanner in one shared finding shape."]
];

function SecurityCoreScene() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = null;
    const update = () => {
      frame = null;
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const value = Math.max(0, Math.min(1, -rect.top / travel));
      setProgress(value);
    };
    const onScroll = () => {
      if (frame == null) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, []);

  const stageIndex = Math.min(stages.length - 1, Math.floor(progress * stages.length));

  return (
    <section ref={sectionRef} className="core-story-section core-story-scroll">
      <div className="core-sticky">
        <div className="page-width core-story-grid">
          <div className="core-orb-wrap" style={{ "--core-progress": progress }}>
            <SecurityOrb label="YOUR WEBSITE" />
            <div className="core-progress-ring" aria-hidden="true" />
          </div>
          <div className="core-copy">
            <span className="cyber-kicker"><span/>FROM SIGNALS TO FINDINGS</span>
            <h2>Watch the assessment turn raw signals into one language.</h2>
            <p>Scroll through the scanner pipeline. The visual stays put while each evidence layer joins the picture.</p>
            <div className="core-stage-list">
              {stages.map(([title, copy], index) => (
                <article key={title} className={index === stageIndex ? "active" : index < stageIndex ? "done" : ""}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <div><strong>{title}</strong><span>{copy}</span></div>
                </article>
              ))}
            </div>
            <div className={`normalized-card ${stageIndex === stages.length - 1 ? "active" : ""}`}>
              <small>NORMALIZED FINDING</small><strong>HSTS_MISSING</strong><div><span>headers</span><span>medium</span><span>high confidence</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SecurityCoreScene;
