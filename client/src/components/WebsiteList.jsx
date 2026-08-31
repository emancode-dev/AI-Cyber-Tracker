import WebsiteCard from "./WebsiteCard";
import EmptyState from "./EmptyState";

function WebsiteList({ websites, onDelete, onScan, onEdit }) {
  if (websites.length === 0) return <EmptyState title="No matching websites" message="Add a website or change the filters." />;
  return <div className="website-grid">{websites.map((website) => <WebsiteCard key={website.id} website={website} onDelete={onDelete} onScan={onScan} onEdit={onEdit} />)}</div>;
}
export default WebsiteList;
