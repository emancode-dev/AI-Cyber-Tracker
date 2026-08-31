import TiltCard from "../emerald/TiltCard";

function MetricCard({ label, value, note, icon, emphasis = false, children }) {
  return (
    <TiltCard className={`metric-card-v2 ${emphasis ? "metric-card-emphasis" : ""}`.trim()}>
      <div className="metric-card-top"><span>{icon}</span><small>{label}</small></div>
      <strong>{value}</strong>
      <p>{note}</p>
      {children}
    </TiltCard>
  );
}

export default MetricCard;
