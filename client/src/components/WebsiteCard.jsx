import Button from "./Button";

function WebsiteCard({
  website,
  onDelete,
  onScan
}) {
  return (
    <div className="border rounded-xl p-5">

      <div className="flex justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            {website.name}
          </h2>

          <p className="text-gray-500">
            {website.url}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Security Score
          </p>

          <p className="text-2xl font-bold">
            {website.score}
          </p>
        </div>

      </div>

      <div className="mt-5 flex gap-3">

        <Button
          onClick={() => onScan(website.id)}
        >
          Scan Website
        </Button>

        <Button
          variant="danger"
          onClick={() => onDelete(website.id)}
        >
          Delete Now
        </Button>

      </div>

    </div>
  );
}

export default WebsiteCard;