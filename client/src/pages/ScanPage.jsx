import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";

function ScanPage() {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  function handleStartScan() {
    setLoading(true);

    console.log(
      "Scan requested for website:",
      websiteId
    );

    // Later:
    // fetch(`/api/websites/${websiteId}/scan`, {
    //   method: "POST"
    // });
  }

  return (
    <div className="min-h-screen p-8">

      <div className="max-w-3xl mx-auto">

        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </Button>

        <div className="mt-8 border rounded-xl p-8">

          <h1 className="text-3xl font-bold">
            Website Security Scan
          </h1>

          <p className="text-gray-500 mt-2">
            Website ID: {websiteId}
          </p>

          <p className="mt-6">
            Start a passive security assessment for
            this website.
          </p>

          <div className="mt-8">

            <Button
              onClick={handleStartScan}
              disabled={loading}
            >
              {loading
                ? "Starting scan..."
                : "Start Scan"}
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ScanPage;