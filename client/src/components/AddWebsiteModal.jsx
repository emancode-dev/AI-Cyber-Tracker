import { useState } from "react";
import Button from "./Button";

function AddWebsiteModal({
  onClose,
  onAddWebsite
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const newWebsite = {
      id: Date.now(),
      name: name,
      url: url,
      score: 0
    };

    onAddWebsite(newWebsite);

    setName("");
    setUrl("");

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white rounded-xl p-6 w-full max-w-md">

        <div className="flex justify-between mb-6">

          <h2 className="text-2xl font-bold">
            Add Website
          </h2>

          <button
            type="button"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="mb-4">

            <label>
              Website Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="My Website"
              required
            />

          </div>

          <div className="mb-6">

            <label>
              Website URL
            </label>

            <input
              type="url"
              value={url}
              onChange={(event) =>
                setUrl(event.target.value)
              }
              placeholder="https://example.com"
              required
            />

          </div>

          <div className="flex gap-3">

            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button type="submit">
              Add Website
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddWebsiteModal;