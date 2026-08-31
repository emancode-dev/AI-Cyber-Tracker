import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardOverview from "../components/dashboard-v2/DashboardOverview";
import { deleteWebsite, getWebsites, updateWebsite } from "../services/websiteService";
import { getDashboardSummary } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  async function loadWebsites() {
    try {
      setLoading(true);
      setError("");
      const [items, dashboardSummary] = await Promise.all([getWebsites(), getDashboardSummary()]);
      setWebsites(items);
      setSummary(dashboardSummary);
    } catch (requestError) {
      setError(requestError.message || "Could not load websites.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([getWebsites(), getDashboardSummary()])
      .then(([items, dashboardSummary]) => { if (active) { setWebsites(items); setSummary(dashboardSummary); } })
      .catch((requestError) => { if (active) setError(requestError.message || "Could not load websites."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleDelete(id) {
    try {
      await deleteWebsite(id);
      setWebsites((current) => current.filter((website) => website.id !== id));
      setSummary(await getDashboardSummary());
    } catch (requestError) {
      setError(requestError.message || "Could not delete website.");
    }
  }

  async function handleUpdate(id, changes) {
    const updated = await updateWebsite(id, changes);
    setWebsites((current) => current.map((website) => website.id === id ? { ...website, ...updated } : website));
    setSummary(await getDashboardSummary());
  }

  return (
    <DashboardOverview
      websites={websites}
      summaryData={summary}
      loading={loading}
      error={error}
      onRetry={loadWebsites}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      onScan={(id) => navigate(`/scan/${id}`)}
    />
  );
}

export default Dashboard;
