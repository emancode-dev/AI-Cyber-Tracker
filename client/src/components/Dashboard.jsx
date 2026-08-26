import { useState } from "react";

import Navbar from "../components/Navbar";
import Button from "../components/Button";
import WebsiteList from "../components/WebsiteList";
import AddWebsiteModal from "../components/AddWebsiteModal";

function Dashboard() {
  const [websites, setWebsites] = useState([
    {
      id: 1,
      name: "GitHub",
      url: "https://github.com",
      score: 91
    },
    {
      id: 2,
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      score: 82
    },
    {
      id: 3,
      name: "My Website",
      url: "https://mywebsite.com",
      score: 74
    }
  ]);

  const [showAddModal, setShowAddModal] =
    useState(false);

  function handleDelete(id) {
    setWebsites((currentWebsites) =>
      currentWebsites.filter(
        (website) => website.id !== id
      )
    );
  }

  function handleNewWebsite(newWebsite) {
    setWebsites((currentWebsites) => [
      ...currentWebsites,
      newWebsite
    ]);
  }

  return (
    <div>

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        <div className="flex justify-between mb-8">

          <div>
            <h2 className="text-3xl font-bold">
              My Websites
            </h2>

            <p>
              Monitor your website security.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
          >
            + Add Website
          </Button>

        </div>

        <WebsiteList
          websites={websites}
          onDelete={handleDelete}
        />

      </main>

      {showAddModal && (
        <AddWebsiteModal
          onClose={() => setShowAddModal(false)}
          onAddWebsite={handleNewWebsite}
        />
      )}

    </div>
  );
}

export default Dashboard;