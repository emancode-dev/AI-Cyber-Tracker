import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../Input";
import Button from "../Button";
function CTASection() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const navigate = useNavigate();
  function handleSubmit(event) { event.preventDefault(); const q = websiteUrl.trim() ? `?website=${encodeURIComponent(websiteUrl.trim())}` : ""; navigate(`/register${q}`); }
  return <section className="cta-section"><div className="page-width cta-grid"><div><p className="eyebrow">Start safely</p><h2>Have an authorized website in mind?</h2><p>Create an account first. The Add Website flow will require an explicit ownership/authorization confirmation.</p></div><form className="cta-form" onSubmit={handleSubmit}><Input id="landing-url" label="Website URL (optional)" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com"/><Button type="submit">Continue</Button></form></div></section>;
}
export default CTASection;
