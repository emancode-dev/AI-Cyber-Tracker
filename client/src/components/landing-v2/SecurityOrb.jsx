const nodes = ["HTTPS", "TLS", "HEADERS", "COOKIES", "FORMS", "REDIRECTS", "METADATA"];

function SecurityOrb({ compact = false, label = "YOUR WEBSITE" }) {
  return (
    <div className={`security-orb ${compact ? "security-orb-compact" : ""}`.trim()} aria-label="Security signal visualization">
      <div className="orb-aura" />
      <div className="orb-grid" />
      <div className="orb-ring orb-ring-a" />
      <div className="orb-ring orb-ring-b" />
      <div className="orb-core">
        <span>SECURITY CORE</span>
        <strong>{label}</strong>
      </div>
      {nodes.map((node, index) => (
        <span key={node} className={`orb-node orb-node-${index + 1}`}>
          <i />{node}
        </span>
      ))}
    </div>
  );
}

export default SecurityOrb;
