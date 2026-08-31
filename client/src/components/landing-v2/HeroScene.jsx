import { useState } from "react";
import { Link } from "react-router-dom";
import SecurityOrb from "./SecurityOrb";

function HeroScene() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setPointer({ x, y });
  }

  return (
    <section className="cyber-hero" id="product" onPointerMove={handlePointerMove} onPointerLeave={() => setPointer({ x: 0, y: 0 })} style={{ "--pointer-x": pointer.x, "--pointer-y": pointer.y }}>
      <div className="cyber-hero-grid" aria-hidden="true" />
      <div className="cyber-hero-aurora cyber-hero-aurora-a" aria-hidden="true" />
      <div className="cyber-hero-aurora cyber-hero-aurora-b" aria-hidden="true" />
      <div className="page-width cyber-hero-inner">
        <div className="cyber-kicker"><span />DEFENSIVE WEBSITE SECURITY INTELLIGENCE</div>
        <h1>Know What Your Website<br/><em>Is Quietly Exposing.</em></h1>
        <p className="cyber-hero-copy">Focused passive scanning, real owner context and deterministic risk analysis — combined into one assessment that tells you what matters and what to fix first.</p>
        <div className="cyber-hero-actions"><Link className="cyber-button cyber-button-solid" to="/register">Start security assessment</Link><a className="cyber-button cyber-button-ghost" href="#how-it-works">See how it works <span>↘</span></a></div>
        <div className="hero-orb-stage"><SecurityOrb compact /></div>
        <div className="trust-strip" aria-label="Product capabilities">{["Passive scanning", "Deterministic scoring", "Privacy-aware", "Adaptive context", "AI explanation"].map((item) => <span key={item}><i/>{item}</span>)}</div>
      </div>
    </section>
  );
}

export default HeroScene;
