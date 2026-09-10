import Button from "./Button";
import { getRiskLabel } from "../utils/risk";

function WebsiteCard({ website, onDelete, onScan = () => {}, onEdit }) {
  const risk = getRiskLabel(website.score);
  return (
    <article className="website-card">
      <div className="website-card-header">
        <div>
          <p className="eyebrow">{risk.label}</p>
          <h2>{website.name}</h2>
          <p className="muted break-word">{website.url}</p>
          <p className="tiny-note">Authorization confirmed {website.authorization_confirmed ? "✓" : "—"}</p>
        </div>
        <div className={`score-badge score-${website.score_pending ? "neutral" : risk.tone}`}>
          <span>Security score</span>
          <strong>{website.score_pending ? "Scanning…" : website.score ?? "—"}</strong>
        </div>
      </div>
      <div className="website-card-actions">
        <Button onClick={() => onScan(website.id)}>Start / open scan</Button>
        <Button variant="secondary" onClick={() => onEdit?.(website)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(website.id)}>Delete</Button>
      </div>
    </article>
  );
}
export default WebsiteCard;
