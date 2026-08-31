const labels = ["TLS", "CSP", "HSTS", "COOKIE", "FORMS", "META", "REDIRECT"];

function SecurityCoreVisual({ compact = false, label = "TARGET" }) {
  return (
    <div className={`v3-security-core ${compact ? "is-compact" : ""}`.trim()} aria-label="Cyber security signal core visualization">
      <div className="v3-core-halo" />
      <div className="v3-core-sphere">
        <div className="v3-core-latitude one" />
        <div className="v3-core-latitude two" />
        <div className="v3-core-latitude three" />
        <div className="v3-core-meridian one" />
        <div className="v3-core-meridian two" />
        <div className="v3-core-meridian three" />
        <div className="v3-core-center"><small>CYBER CORE</small><strong>{label}</strong></div>
      </div>
      <div className="v3-core-orbit-ring ring-a" />
      <div className="v3-core-orbit-ring ring-b" />
      <div className="v3-core-orbit-ring ring-c" />
      {labels.map((item, index) => <span className={`v3-core-label label-${index + 1}`} key={item}><i />{item}</span>)}
      <span className="v3-orbit-particle p1" /><span className="v3-orbit-particle p2" /><span className="v3-orbit-particle p3" />
    </div>
  );
}

export default SecurityCoreVisual;
