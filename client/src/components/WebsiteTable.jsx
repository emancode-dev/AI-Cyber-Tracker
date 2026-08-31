import Button from "./Button";
import EmptyState from "./EmptyState";
import { getRiskLabel } from "../utils/risk";

function WebsiteTable({ websites, onDelete, onScan, onEdit }) {
  if (websites.length === 0) return <EmptyState title="No matching websites" message="Add a website or change the filters." />;
  return (
    <div className="table-wrap"><table className="website-table"><thead><tr><th>Website</th><th>Score</th><th>Risk</th><th>Actions</th></tr></thead><tbody>
      {websites.map((website) => {
        const risk = getRiskLabel(website.score);
        return <tr key={website.id}><td><strong>{website.name}</strong><span className="table-subtext">{website.url}</span></td><td>{website.score ?? "Not scanned"}</td><td>{risk.label}</td><td><div className="table-actions"><Button onClick={() => onScan(website.id)}>Scan</Button><Button variant="secondary" onClick={() => onEdit?.(website)}>Edit</Button><Button variant="danger" onClick={() => onDelete(website.id)}>Delete</Button></div></td></tr>;
      })}
    </tbody></table></div>
  );
}
export default WebsiteTable;
