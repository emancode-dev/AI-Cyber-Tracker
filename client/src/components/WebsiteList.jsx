import WebsiteCard from "./WebsiteCard";

function WebsiteList({
  websites,
  onDelete,
  onScan
}) {
  if (websites.length === 0) {
    return (
      <div>
        <h2>No websites yet</h2>

        <p>
          Add a website to start monitoring it.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">

      {websites.map((website) => (
        <WebsiteCard
          key={website.id}
          website={website}
          onDelete={onDelete}
          onScan={onScan}
        />
      ))}

    </div>
  );
}

export default WebsiteList;